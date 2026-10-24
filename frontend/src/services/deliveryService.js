import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = (token) => ({
  headers: {
    authorization: `Bearer ${token}`,
  },
});

export const deliveryService = {
  // 0. Settings: Fetch delivery configuration
  getSettings: async (token) => {
    const { data } = await axios.get(
      `${API_URL}/delivery/settings`,
      getAuthHeaders(token)
    );
    return data;
  },

  // 0.1 Settings: Update delivery configuration (ADMIN ONLY)
  updateSettings: async (settings, token) => {
    const { data } = await axios.put(
      `${API_URL}/delivery/settings`,
      settings,
      getAuthHeaders(token)
    );
    return data;
  },

  // 1. Staff: Get delivery queue (ReadyForPickup orders & available drivers)
  getQueue: async (token) => {
    const { data } = await axios.get(
      `${API_URL}/delivery/queue`,
      getAuthHeaders(token)
    );
    return data;
  },

  // 2. Staff: Assign order to driver
  assignOrder: async ({ orderId, riderId }, token) => {
    const { data } = await axios.post(
      `${API_URL}/delivery/assign`,
      { orderId, riderId },
      getAuthHeaders(token)
    );
    return data;
  },

  // 2.1 Staff: Unassign order and return it to queue
  unassignOrder: async (orderId, token) => {
    const { data } = await axios.post(
      `${API_URL}/delivery/unassign/${orderId}`,
      {},
      getAuthHeaders(token)
    );
    return data;
  },

  // 3. Driver: Confirm pickup from branch counter (single or bulk)
  confirmPickup: async (orderId, token, riderId = null, all = false) => {
    const { data } = await axios.post(
      `${API_URL}/delivery/confirm-pickup`,
      { orderId, riderId, all },
      getAuthHeaders(token)
    );
    return data;
  },

  // 4. Driver: Verify customer OTP (or Force Submit / Override)
  verifyOtp: async (
    { orderId, otp, riderId = null, forceSubmit = false, overrideReason = null },
    token
  ) => {
    const { data } = await axios.post(
      `${API_URL}/delivery/verify-otp`,
      { orderId, otp, riderId, forceSubmit, overrideReason },
      getAuthHeaders(token)
    );
    return data;
  },

  // 5. Driver: Scan branch QR code
  qrCheckIn: async (qrCode, token, riderId = null) => {
    const { data } = await axios.post(
      `${API_URL}/delivery/qr-checkin`,
      { qrCode, riderId },
      getAuthHeaders(token)
    );
    return data;
  },

  // 5.1 Driver: Logout and become unavailable
  riderLogout: async (token, riderId = null) => {
    const { data } = await axios.post(
      `${API_URL}/delivery/rider-logout`,
      { riderId },
      getAuthHeaders(token)
    );
    return data;
  },

  // 6. Staff: Manual driver check-in fallback
  manualCheckIn: async (riderId, token) => {
    const { data } = await axios.post(
      `${API_URL}/delivery/manual-checkin/${riderId}`,
      {},
      getAuthHeaders(token)
    );
    return data;
  },

  // 7. Driver: Fetch my status & assigned order
  getMyStatus: async (token, riderId = null) => {
    const url = riderId
      ? `${API_URL}/delivery/my-status?riderId=${riderId}`
      : `${API_URL}/delivery/my-status`;
    const { data } = await axios.get(url, getAuthHeaders(token));
    return data;
  },

  // 8. Staff: Get driver analytics and KPIs
  getDriverAnalytics: async (token, period = "all", driverId = null) => {
    let url = `${API_URL}/delivery/driver-stats?period=${period}`;
    if (driverId) url += `&driverId=${driverId}`;
    const { data } = await axios.get(url, getAuthHeaders(token));
    return data;
  },
};

export default deliveryService;
