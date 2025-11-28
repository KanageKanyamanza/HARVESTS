import { useState, useEffect } from 'react';
import { producerService, transformerService, restaurateurService, exporterService, transporterService, reviewService } from '../services';
import { getVendorAverageRating, getVendorReviewCount } from '../utils/vendorRatings';

const VENDOR_TYPES = ['producer', 'transformer', 'restaurateur', 'exporter', 'transporter'];

const servicesMap = {
  producer: producerService,
  transformer: transformerService,
  restaurateur: restaurateurService,
  exporter: exporterService,
  transporter: transporterService
};

export const useVendorStats = (user) => {
  const [vendorStats, setVendorStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !VENDOR_TYPES.includes(user.userType)) {
      setVendorStats(null);
      return;
    }

    const loadVendorStats = async () => {
      try {
        setLoading(true);
        const service = servicesMap[user.userType];
        if (!service?.getPublic || !user?._id) {
          setVendorStats(null);
          return;
        }

        const response = await service.getPublic(user._id);
        const responseData = response?.data;

        let vendorData = null;
        if (responseData?.data) {
          vendorData = responseData.data[user.userType] || responseData.data.vendor || responseData.data;
        }
        if (!vendorData && responseData) {
          vendorData = responseData[user.userType] || responseData.vendor || responseData;
        }
        if (vendorData?.data) {
          vendorData = vendorData.data[user.userType] || vendorData.data.vendor || vendorData.data;
        }

        if (!vendorData) {
          setVendorStats(null);
          return;
        }

        let averageRating = getVendorAverageRating(vendorData);
        let reviewCount = getVendorReviewCount(vendorData);

        if (['producer', 'transformer'].includes(user.userType)) {
          try {
            const statsResponse = await reviewService.getProducerRatingStats(user._id);
            const statsData = statsResponse?.data;
            if (statsData) {
              averageRating = statsData.averageRating ?? averageRating;
              reviewCount = statsData.totalReviews ?? reviewCount;
            }
          } catch (statsError) {
            console.error('Erreur stats avis:', statsError);
          }
        }

        setVendorStats({ averageRating, reviewCount });
      } catch (error) {
        console.error('Erreur chargement notes vendeur:', error);
        setVendorStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadVendorStats();
  }, [user]);

  return { vendorStats, loading };
};

export const useVerificationStatus = (user) => {
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    if (user) {
      setVerificationStatus({
        email: { verified: user.isEmailVerified },
        phone: { verified: user.isPhoneVerified },
        overall: { level: user.verificationLevel || 'Non vérifié' }
      });
    }
  }, [user]);

  return verificationStatus;
};

