"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Cloud, CloudSun, Sun, Droplets, Wind, MapPin, Eye, Gauge, RefreshCw } from "lucide-react"
import { LineChart, Line, XAxis, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { fetchCurrentWeather, fetchForecast, searchLocations } from "@/lib/weatherService"

interface WeatherData {
  current?: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    uv: number;
    vis_km: number;
    pressure_mb: number;
    air_quality: {
      "us-epa-index": number;
      pm2_5?: number;
      pm10?: number;
      o3?: number;
      no2?: number;
    };
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        chance_of_rain: number;
      }>;
    }>;
  };
}

// Add helper function to get AQI level description
function getAQILevel(index: number): { label: string; color: string } {
  switch(index) {
    case 1:
      return { label: 'Good', color: 'bg-green-500' };
    case 2:
      return { label: 'Moderate', color: 'bg-yellow-500' };
    case 3:
      return { label: 'Unhealthy for Sensitive', color: 'bg-orange-500' };
    case 4:
      return { label: 'Unhealthy', color: 'bg-red-500' };
    case 5:
      return { label: 'Very Unhealthy', color: 'bg-purple-500' };
    case 6:
      return { label: 'Hazardous', color: 'bg-red-900' };
    default:
      return { label: 'Unknown', color: 'bg-gray-500' };
  }
}

export default function Home() {
  const [city, setCity] = useState("London")
  const [searchQuery, setSearchQuery] = useState("")
  const [offline, setOffline] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState([])
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if online
    setOffline(!navigator.onLine)

    // Listen for network status changes
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Starting to fetch data for city:', city)
        
        const [current, forecast] = await Promise.all([
          fetchCurrentWeather(city),
          fetchForecast(city, 7)
        ])
        
        setWeatherData({ 
          current: current.current, 
          forecast: forecast.forecast 
        })
        setLastUpdated(new Date())
        
      } catch (error: any) {
        console.error('Detailed error:', error)
        setError(error?.response?.data?.error?.message || 'Failed to fetch weather data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [city])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setCity(searchQuery)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const handleSearchInput = async (value: string) => {
    setSearchQuery(value)
    if (value.length > 2) {
      try {
        const results = await searchLocations(value)
        setSearchResults(results)
      } catch (error) {
        console.error('Error searching locations:', error)
      }
    }
  }

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true)
      setLocationError(null)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          console.log('Got coordinates:', latitude, longitude)
          try {
            // First try to get the location name using reverse geocoding
            const locations = await searchLocations(`${latitude},${longitude}`)
            console.log('All location results:', locations)
            
            if (locations && locations.length > 0) {
              // Try to find Taipa specifically
              const taipaLocation = locations.find(loc => 
                loc.name.toLowerCase().includes('taipa') || 
                loc.name.includes('氹仔')
              )
              
              if (taipaLocation) {
                console.log('Found Taipa location:', taipaLocation)
                setCity('Macau-taipa')
              } else {
                // If not Taipa, use the first location but ensure it's formatted nicely
                const firstLocation = locations[0]
                if (firstLocation.name.toLowerCase().includes('macau') || 
                    firstLocation.name.toLowerCase().includes('macao')) {
                  setCity(firstLocation.name)
                } else {
                  setCity('Macau-taipa') // Default to Macau-taipa if no specific match
                }
              }
            } else {
              // If no locations found, default to Macau-taipa
              setCity('Macau-taipa')
            }
          } catch (error) {
            console.error('Error searching location:', error)
            setCity('Macau-taipa') // Default to Macau-taipa on error
          }
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationError("Could not access location. Please allow location access.")
          setIsLocating(false)
        },
        { 
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0
        }
      )
    } else {
      setLocationError("Geolocation is not supported by your browser")
    }
  }

  function getWeatherIcon(condition: string, size: "normal" | "large" = "normal") {
    const sizeClass = size === "large" ? "h-20 w-20" : "h-6 w-6"
    condition = condition?.toLowerCase() || ''
    
    if (condition.includes('sun') && condition.includes('cloud')) {
      return <CloudSun className={sizeClass} />
    } else if (condition.includes('cloud')) {
      return <Cloud className={sizeClass} />
    } else if (condition.includes('rain')) {
      return <Droplets className={sizeClass} />
    } else {
      return <Sun className={sizeClass} />
    }
  }

  // Format data for the temperature chart
  const chartData = weatherData.forecast?.forecastday?.[0]?.hour?.map(hour => ({
    time: new Date(hour.time).getHours() + ':00',
    temp: hour.temp_c
  })) || []

  // Format data for rain chance - get all hours instead of just last 4
  const rainData = weatherData.forecast?.forecastday?.[0]?.hour?.map(hour => ({
    time: new Date(hour.time).getHours() + ':00',
    chance: hour.chance_of_rain
  })) || []

  console.log('Rain data:', rainData)

  // Format data for forecast
  const forecastData = weatherData.forecast?.forecastday?.map(day => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temp: day.day.maxtemp_c,
    feelsLike: day.day.mintemp_c,
    condition: day.day.condition.text,
    icon: getWeatherIcon(day.day.condition.text)
  })) || []

  // Add refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const [current, forecast] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city, 7)
      ])
      
      setWeatherData({ 
        current: current.current, 
        forecast: forecast.forecast 
      })
      setLastUpdated(new Date())
    } catch (error: any) {
      console.error('Error refreshing data:', error)
      setError(error?.response?.data?.error?.message || 'Failed to refresh weather data')
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-md bg-[#e8d5f9] min-h-screen">
        {offline && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p>You are currently offline. Showing cached data.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="p-4 flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-medium">{city}</h2>
                    {lastUpdated && (
                      <p className="text-sm text-gray-600">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/30 rounded-full p-1 h-8 w-8"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/30 rounded-full p-1 h-8 w-8"
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                    >
                      <MapPin className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-white/30 rounded-full p-1 h-8 w-8">
                          <Search className="h-4 w-4 text-gray-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Search Location</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSearch} className="flex items-center space-x-2">
                          <Input
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="Enter city name"
                            className="flex-1"
                          />
                          <Button type="submit">Search</Button>
                        </form>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Search Results</h4>
                          <div className="space-y-2">
                            {searchResults.map((result: any, index: number) => (
                              <Button
                                key={index}
                                variant="ghost"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                  setCity(result.name)
                                  setIsSearchOpen(false)
                                }}
                              >
                                {result.name}, {result.country}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {locationError && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4">
                    <p>{locationError}</p>
                  </div>
                )}

                {isLocating && (
                  <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-4">
                    <p>Detecting your location...</p>
                  </div>
                )}
              </div>

              {isRefreshing && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-4">
                  <p>Refreshing weather data...</p>
                </div>
              )}
            </div>

            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid grid-cols-3 bg-transparent mb-4 px-4">
                <TabsTrigger value="today" className="data-[state=active]:bg-white/30 rounded-full">
                  Today
                </TabsTrigger>
                <TabsTrigger value="tomorrow" className="data-[state=active]:bg-white/30 rounded-full">
                  Tomorrow
                </TabsTrigger>
                <TabsTrigger value="10days" className="data-[state=active]:bg-white/30 rounded-full">
                  7 days
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="p-4">
                <Card className="bg-white/30 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{weatherData.current?.temp_c}°C</h3>
                      <p className="text-sm text-gray-600">{weatherData.current?.condition.text}</p>
                    </div>
                    <div>
                      {getWeatherIcon(weatherData.current?.condition.text || '', "large")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Feels like</span>
                      <span>{weatherData.current?.feelslike_c}°C</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Humidity</span>
                      <span>{weatherData.current?.humidity}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Wind</span>
                      <span>{weatherData.current?.wind_kph} km/h</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Temperature</h4>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <XAxis dataKey="time" />
                          <Line type="monotone" dataKey="temp" stroke="#000" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Chance of Rain (24 hours)</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {rainData.map((hour, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm w-16">{hour.time}</span>
                          <div className="flex-1 mx-4">
                            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${hour.chance}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm w-16 text-right">{hour.chance}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/20 rounded-lg">
                    <p className="text-sm">
                      Highest chance of rain: {Math.max(...rainData.map(h => h.chance))}%
                    </p>
                  </div>
                </Card>

                {/* New card for additional weather data */}
                <Card className="bg-white/30 p-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4">Detailed Weather Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* UV Index */}
                    <div className="flex items-center space-x-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">UV Index</p>
                        <p className="font-medium">{weatherData.current?.uv || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Visibility</p>
                        <p className="font-medium">{weatherData.current?.vis_km || 'N/A'} km</p>
                      </div>
                    </div>

                    {/* Pressure */}
                    <div className="flex items-center space-x-2">
                      <Gauge className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Pressure</p>
                        <p className="font-medium">{weatherData.current?.pressure_mb || 'N/A'} mb</p>
                      </div>
                    </div>
                  </div>

                  {/* Air Quality Section */}
                  {weatherData.current?.air_quality && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-3">Air Quality</h4>
                      <div className="space-y-3">
                        {/* AQI Level */}
                        {weatherData.current.air_quality["us-epa-index"] && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Air Quality Index</span>
                            <div className="flex items-center space-x-2">
                              <div className={`h-3 w-3 rounded-full ${getAQILevel(weatherData.current.air_quality["us-epa-index"]).color}`} />
                              <span className="text-sm font-medium">
                                {getAQILevel(weatherData.current.air_quality["us-epa-index"]).label}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Detailed AQI Components */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">PM2.5:</span>
                            <span className="ml-2">{weatherData.current.air_quality.pm2_5?.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">PM10:</span>
                            <span className="ml-2">{weatherData.current.air_quality.pm10?.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">O₃:</span>
                            <span className="ml-2">{weatherData.current.air_quality.o3?.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">NO₂:</span>
                            <span className="ml-2">{weatherData.current.air_quality.no2?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="tomorrow" className="p-4">
                <Card className="bg-white/30 p-4">
                  {weatherData.forecast?.forecastday?.[1] && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{weatherData.forecast.forecastday[1].day.maxtemp_c}°C</h3>
                          <p className="text-sm text-gray-600">{weatherData.forecast.forecastday[1].day.condition.text}</p>
                        </div>
                        <div>
                          {getWeatherIcon(weatherData.forecast.forecastday[1].day.condition.text, "large")}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Min Temperature</span>
                          <span>{weatherData.forecast.forecastday[1].day.mintemp_c}°C</span>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="10days" className="p-4">
                <div className="space-y-4">
                  {forecastData.map((day, index) => (
                    <div key={index} className="bg-white/30 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{day.day}</div>
                        <div className="text-sm text-gray-600">{day.date}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2">{day.icon}</div>
                        <div className="text-right">
                          <div className="font-medium">{day.temp}°</div>
                          <div className="text-sm text-gray-600">{day.feelsLike}°</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  )
}

