from typing import List, Dict, Any, Optional
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
import numpy as np
from services.supabase_client import get_supabase_client


class RecommendationEngine:
    def __init__(self):
        self.supabase = get_supabase_client()
        
    def get_recommendations(self, user_id: str, limit: int = 20, 
                           exclude_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Get personalized artwork recommendations for a user
        
        Combines:
        1. Collaborative filtering (users with similar tastes)
        2. Content-based filtering (similar to liked artworks)
        3. Budget constraints
        4. Diversity (avoid showing too similar pieces)
        """
        if not self.supabase:
            return []
        
        # Get user profile and preferences
        user_response = self.supabase.table('users').select('*').eq('id', user_id).execute()
        if not user_response.data:
            return self._get_cold_start_recommendations(limit, exclude_ids)
        
        user = user_response.data[0]
        budget_min = user.get('budget_min', 0)
        budget_max = user.get('budget_max', 10000)
        preferences = user.get('preferences', {})
        
        # Get user's swipe history
        swipes_response = self.supabase.table('swipes').select('*').eq('user_id', user_id).execute()
        liked_artwork_ids = [s['artwork_id'] for s in swipes_response.data if s['action'] == 'like']
        passed_artwork_ids = [s['artwork_id'] for s in swipes_response.data if s['action'] == 'pass']
        
        # Combine excluded IDs
        all_excluded = set(liked_artwork_ids + passed_artwork_ids + (exclude_ids or []))
        
        # If user has likes, use content-based + collaborative filtering
        if liked_artwork_ids:
            recommendations = self._get_personalized_recommendations(
                user, liked_artwork_ids, all_excluded, budget_min, budget_max, limit
            )
        else:
            # Cold start: use preferences from onboarding
            recommendations = self._get_preference_based_recommendations(
                preferences, budget_min, budget_max, all_excluded, limit
            )
        
        return recommendations
    
    def _get_cold_start_recommendations(self, limit: int, exclude_ids: Optional[List[str]]) -> List[Dict[str, Any]]:
        """Get recommendations for users with no profile (cold start)"""
        if not self.supabase:
            return []
        
        query = self.supabase.table('artworks').select('*').eq('availability_status', 'available')
        
        if exclude_ids:
            query = query.not_.in_('id', exclude_ids)
        
        response = query.limit(limit).execute()
        return response.data if response.data else []
    
    def _get_preference_based_recommendations(self, preferences: Dict[str, Any], 
                                             budget_min: int, budget_max: int,
                                             exclude_ids: set, limit: int) -> List[Dict[str, Any]]:
        """Get recommendations based on onboarding preferences"""
        if not self.supabase:
            return []
        
        styles = preferences.get('styles', {})
        preferred_styles = [style for style, score in styles.items() if score > 0.5] if styles else []
        
        # Build query
        query = self.supabase.table('artworks').select('*')
        query = query.gte('price', budget_min).lte('price', budget_max)
        query = query.eq('availability_status', 'available')
        
        if exclude_ids:
            query = query.not_.in_('id', list(exclude_ids))
        
        if preferred_styles:
            query = query.in_('style', preferred_styles)
        
        response = query.limit(limit * 2).execute()
        artworks = response.data if response.data else []
        
        # Shuffle and limit
        import random
        random.shuffle(artworks)
        return artworks[:limit]
    
    def _get_personalized_recommendations(self, user: Dict[str, Any], 
                                         liked_artwork_ids: List[str],
                                         exclude_ids: set, budget_min: int, 
                                         budget_max: int, limit: int) -> List[Dict[str, Any]]:
        """Get personalized recommendations based on user's likes"""
        if not self.supabase:
            return []
        
        # Get liked artworks to analyze
        liked_response = self.supabase.table('artworks').select('*').in_('id', liked_artwork_ids).execute()
        liked_artworks = liked_response.data if liked_response.data else []
        
        if not liked_artworks:
            return self._get_preference_based_recommendations(
                user.get('preferences', {}), budget_min, budget_max, exclude_ids, limit
            )
        
        # Analyze liked artworks for patterns
        liked_styles = [a['style'] for a in liked_artworks]
        liked_mediums = [a['medium'] for a in liked_artworks]
        liked_price_avg = sum(a['price'] for a in liked_artworks) / len(liked_artworks)
        
        # Find most common styles and mediums
        from collections import Counter
        style_counts = Counter(liked_styles)
        medium_counts = Counter(liked_mediums)
        
        top_styles = [style for style, _ in style_counts.most_common(3)]
        top_mediums = [medium for medium, _ in medium_counts.most_common(2)]
        
        # Get candidate artworks
        query = self.supabase.table('artworks').select('*')
        query = query.gte('price', budget_min).lte('price', budget_max)
        query = query.eq('availability_status', 'available')
        
        if exclude_ids:
            query = query.not_.in_('id', list(exclude_ids))
        
        response = query.limit(100).execute()
        candidates = response.data if response.data else []
        
        # Score candidates and generate explanations
        scored_candidates = []
        for artwork in candidates:
            score, explanation = self._calculate_artwork_score_with_explanation(
                artwork, top_styles, top_mediums, liked_price_avg, style_counts
            )
            artwork_with_explanation = {**artwork, 'explanation': explanation}
            scored_candidates.append((artwork_with_explanation, score))

        # Sort by score and return top results
        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        # Add diversity: don't return too many from same artist/style
        diverse_results = []
        seen_artists = set()
        result_style_counts = {}

        for artwork, score in scored_candidates:
            artist = artwork['artist']
            style = artwork['style']

            # Skip if we have too many from this artist or style
            if seen_artists.count(artist) >= 2:
                continue
            if result_style_counts.get(style, 0) >= limit // 3:
                continue

            diverse_results.append(artwork)
            seen_artists.add(artist)
            result_style_counts[style] = result_style_counts.get(style, 0) + 1

            if len(diverse_results) >= limit:
                break

        return diverse_results
    
    def _calculate_artwork_score(self, artwork: Dict[str, Any],
                                 preferred_styles: List[str],
                                 preferred_mediums: List[str],
                                 avg_price: float) -> float:
        """Calculate similarity score for an artwork"""
        score = 0.0

        # Style match (40% weight)
        if artwork['style'] in preferred_styles:
            style_index = preferred_styles.index(artwork['style'])
            score += (3 - style_index) * 0.13  # First choice gets more weight

        # Medium match (20% weight)
        if artwork['medium'] in preferred_mediums:
            score += 0.2

        # Price similarity (20% weight)
        price_diff = abs(artwork['price'] - avg_price) / avg_price if avg_price > 0 else 1
        price_score = max(0, 1 - price_diff)
        score += price_score * 0.2

        # Recency (10% weight) - prefer newer works
        year = artwork.get('year_created', 2020)
        if year >= 2023:
            score += 0.1
        elif year >= 2020:
            score += 0.05

        # Random factor for diversity (10% weight)
        import random
        score += random.random() * 0.1

        return score

    def _calculate_artwork_score_with_explanation(self, artwork: Dict[str, Any],
                                                   preferred_styles: List[str],
                                                   preferred_mediums: List[str],
                                                   avg_price: float,
                                                   liked_style_counts: Counter) -> tuple:
        """Calculate similarity score and generate explanation for an artwork"""
        score = 0.0
        reasons = []

        # Style match (40% weight)
        if artwork['style'] in preferred_styles:
            style_index = preferred_styles.index(artwork['style'])
            score += (3 - style_index) * 0.13
            like_count = liked_style_counts.get(artwork['style'], 0)
            if style_index == 0:
                reasons.append(f"Matches your favorite style ({artwork['style']})")
            else:
                reasons.append(f"Similar to {like_count} artworks you liked")

        # Medium match (20% weight)
        if artwork['medium'] in preferred_mediums:
            score += 0.2
            reasons.append(f"You enjoy {artwork['medium']} works")

        # Price similarity (20% weight)
        price_diff = abs(artwork['price'] - avg_price) / avg_price if avg_price > 0 else 1
        price_score = max(0, 1 - price_diff)
        score += price_score * 0.2
        if price_score > 0.7:
            reasons.append("Within your typical price range")

        # Artist match (bonus)
        artist = artwork.get('artist', '')
        if artist:
            reasons.append(f"By {artist}")

        # Recency (10% weight)
        year = artwork.get('year_created', 2020)
        if year >= 2023:
            score += 0.1
        elif year >= 2020:
            score += 0.05

        # Random factor for diversity (10% weight)
        import random
        score += random.random() * 0.1

        # Generate explanation string
        if reasons:
            explanation = reasons[0] if len(reasons) == 1 else f"{reasons[0]} · {reasons[1]}" if len(reasons) >= 2 else reasons[0]
        else:
            explanation = "Recommended based on your preferences"

        return score, explanation


# Global instance
recommendation_engine = RecommendationEngine()
