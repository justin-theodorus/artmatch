import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Image, Linking } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { Gallery, Artwork } from '../types'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/styles'
import { galleryAPI } from '../services/api'

export default function GalleryProfileScreen ({ route, navigation }: any) {
  const { galleryId } = route.params
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadGalleryData()
  }, [galleryId])
  
  const loadGalleryData = async () => {
    try {
      setLoading(true)
      const galleryData = await galleryAPI.getGallery(galleryId)
      const artworksData = await galleryAPI.getGalleryArtworks(galleryId)
      setGallery(galleryData)
      setArtworks(artworksData)
    } catch (error) {
      console.error('Error loading gallery:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleContact = (type: 'phone' | 'email' | 'website') => {
    if (!gallery) return
    
    const contact = gallery.contact
    let url = ''
    
    switch (type) {
      case 'phone':
        if (contact.phone) url = `tel:${contact.phone}`
        break
      case 'email':
        if (contact.email) url = `mailto:${contact.email}`
        break
      case 'website':
        if (contact.website) url = contact.website
        break
    }
    
    if (url) {
      Linking.openURL(url)
    }
  }
  
  const handleGetDirections = () => {
    if (!gallery) return
    const url = `https://maps.apple.com/?daddr=${gallery.latitude},${gallery.longitude}`
    Linking.openURL(url)
  }
  
  const renderArtworkItem = ({ item }: { item: Artwork }) => (
    <TouchableOpacity
      style={styles.artworkCard}
      onPress={() => navigation.navigate('ArtworkDetail', { artworkId: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.artworkImage} resizeMode="cover" />
      <Text style={styles.artworkTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.artworkPrice}>${item.price.toLocaleString()}</Text>
    </TouchableOpacity>
  )
  
  if (loading || !gallery) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{gallery.name}</Text>
        {gallery.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified Gallery</Text>
          </View>
        )}
      </View>
      
      {gallery.description && (
        <Text style={styles.description}>{gallery.description}</Text>
      )}
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: gallery.latitude,
            longitude: gallery.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
        >
          <Marker
            coordinate={{
              latitude: gallery.latitude,
              longitude: gallery.longitude
            }}
            title={gallery.name}
          />
        </MapView>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.address}>{gallery.address}</Text>
        {gallery.opening_hours && (
          <Text style={styles.openingHours}>{gallery.opening_hours}</Text>
        )}
        <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
          <Text style={styles.directionsText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.contactButtons}>
          {gallery.contact.phone && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('phone')}
            >
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          {gallery.contact.email && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('email')}
            >
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
          )}
          {gallery.contact.website && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact('website')}
            >
              <Text style={styles.contactButtonText}>Website</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {artworks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Artworks ({artworks.length})</Text>
          <FlatList
            data={artworks}
            renderItem={renderArtworkItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artworksList}
          />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  header: {
    padding: SPACING.lg
  },
  name: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  verifiedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start'
  },
  verifiedText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.success,
    fontWeight: '600'
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    lineHeight: 24
  },
  mapContainer: {
    height: 200,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden'
  },
  map: {
    flex: 1
  },
  section: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  address: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  openingHours: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textLight,
    marginBottom: SPACING.md
  },
  directionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start'
  },
  directionsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600'
  },
  contactButtons: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  contactButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  contactButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600'
  },
  artworksList: {
    gap: SPACING.md
  },
  artworkCard: {
    width: 150
  },
  artworkImage: {
    width: '100%',
    height: 150,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm
  },
  artworkTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  artworkPrice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary
  }
})
