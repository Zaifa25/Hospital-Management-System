"use client"

import useSWR from "swr"
import axios from "axios"

export function useDepartments() {
  const fetcher = async (url: string) => {
    const token = localStorage.getItem("hms_jwt")
    const res = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    const data = res.data
    return Array.isArray(data) ? data : data.items || data.data || []
  }

  const { data, error, isLoading } = useSWR<any[]>(
    "http://localhost:5000/api/departments",
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )

  return {
    departments: data?.map(d => ({
      label: d.name,
      value: Number(d.id), // Ensure ID is a number
    })) || [],
    isLoading,
    error
  }
}