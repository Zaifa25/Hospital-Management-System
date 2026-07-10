import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useAppointmentNumbers() {
  const [nextNumbers, setNextNumbers] = useState<{ tokenNo: number; appointNo: number }>({ tokenNo: 1, appointNo: 1000 });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLastNumbers = useCallback(async () => {
    try {
      const token = localStorage.getItem("hms_jwt");
      const response = await axios.get('http://localhost:5000/api/appointments', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Normalize response shapes: array | { items: [] } | { data: [] }
      const raw = response.data
      const appointments = Array.isArray(raw) ? raw : raw?.data || raw?.items || []

      if (appointments.length > 0) {
        // Find the highest token number and appointment number
        const maxTokenNo = Math.max(...appointments.map((a: any) => Number(a.tokenNo) || 0));
        const maxAppointNo = Math.max(...appointments.map((a: any) => Number(a.appointNo) || 0));
        
        setNextNumbers({
          tokenNo: maxTokenNo + 1,
          appointNo: maxAppointNo + 1
        });
      } else {
        // If no appointments, set sensible defaults
        setNextNumbers({ tokenNo: 1, appointNo: 1000 })
      }
    } catch (error) {
      console.error('Error fetching appointment numbers:', error);
    }
  }, []);

  useEffect(() => {
    fetchLastNumbers();
  }, [fetchLastNumbers, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    numbers: nextNumbers,
    refresh: refresh
  };
}