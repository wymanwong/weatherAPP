"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Cloud, CloudSun, Sun, Droplets, Wind } from "lucide-react"
import { LineChart, Line, XAxis, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function Home() {
  const [city, setCity] = useState("Kharkiv, Ukraine")
  const [searchQuery, setSearchQuery] = useState("")
  const [offline, setOffline] = useState(false)
  const [selectedSubTab, setSelectedSubTab] = useState("today")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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

  // Mock search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setCity(searchQuery)
      setIsSearchOpen(false)
    }
  }

  // Mock data for the temperature chart
  const chartData = [
    { time: "Mon", temp: 3 },
    { time: "Tue", temp: 4 },
    { time: "Wed", temp: 5 },
    { time: "Thu", temp: 6 },
    { time: "Fri", temp: 5 },
    { time: "Sat", temp: 4 },
    { time: "Sun", temp: 3 },
  ]

  // Mock data for rain chance
  const rainData = [
    { time: "7 PM", chance: 27 },
    { time: "8 PM", chance: 44 },
    { time: "9 PM", chance: 56 },
    { time: "10 PM", chance: 72 },
  ]

  // Mock data for 10-day forecast
  const tenDayForecast = [
    {
      day: "Today",
      date: "",
      temp: 3,
      feelsLike: -2,
      condition: "Cloudy and Sunny",
      icon: <CloudSun className="h-6 w-6" />,
    },
    { day: "Tomorrow", date: "", temp: 3, feelsLike: -2, condition: "Cloudy", icon: <Cloud className="h-6 w-6" /> },
    {
      day: "Thursday, Jan 19",
      date: "",
      temp: 3,
      feelsLike: -2,
      condition: "Cloudy",
      icon: <Cloud className="h-6 w-6" />,
    },
    {
      day: "Thursday, Jan 20",
      date: "",
      temp: 3,
      feelsLike: -2,
      condition: "Cloudy",
      icon: <Cloud className="h-6 w-6" />,
    },
    {
      day: "Thursday, Jan 21",
      date: "",
      temp: 3,
      feelsLike: -2,
      condition: "Cloudy and Sunny",
      icon: <CloudSun className="h-6 w-6" />,
    },
    {
      day: "Thursday, Jan 22",
      date: "",
      temp: 3,
      feelsLike: -2,
      condition: "Cloudy",
      icon: <Cloud className="h-6 w-6" />,
    },
    {
      day: "Thursday, Jan 23",
      date: "",
      temp: 3,
      feelsLike: -2,
      condition: "Cloudy and Sunny",
      icon: <CloudSun className="h-6 w-6" />,
    },
  ]

  // Custom weather icon component that combines sun and cloud
  const WeatherIcon = ({ size = "normal" }) => {
    const sizeClasses = size === "large" ? "h-20 w-20" : "h-6 w-6"

    return (
      <div className={`relative ${sizeClasses}`}>
        <div className={`absolute ${size === "large" ? "-top-4 -left-4" : "-top-1 -left-1"}`}>
          <div className={`rounded-full bg-yellow-300 ${size === "large" ? "w-12 h-12" : "w-4 h-4"}`}></div>
        </div>
        <Cloud className={`${sizeClasses} text-white`} />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-md bg-[#e8d5f9] min-h-screen">
        {offline && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p>You are currently offline. Showing cached data.</p>
          </div>
        )}

        <div className="p-4 flex items-center">
          <div className="flex-1">
            <h2 className="text-lg font-medium">{city}</h2>
          </div>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city name"
                  className="flex-1"
                />
                <Button type="submit">Search</Button>
              </form>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recent Searches</h4>
                <div className="space-y-2">
                  {["New York", "London", "Tokyo", "Paris"].map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setCity(item)
                        setIsSearchOpen(false)
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
              10 days
            </TabsTrigger>
          </TabsList>

          {/* Today Tab - Main Weather View */}
          <TabsContent value="today" className="mt-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-7xl font-light">3°</h1>
                  <p className="text-sm">Feels like -2°</p>
                </div>
                <div className="flex flex-col items-center">
                  <WeatherIcon size="large" />
                  <p className="text-sm mt-2">Cloudy</p>
                </div>
              </div>

              <div className="text-xs text-gray-700 mb-2">January 18, 16:14</div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <Button
                  variant={selectedSubTab === "today" ? "secondary" : "ghost"}
                  onClick={() => setSelectedSubTab("today")}
                  className={`rounded-full text-xs py-1 h-8 ${selectedSubTab === "today" ? "bg-white/30" : ""}`}
                >
                  Today
                </Button>
                <Button
                  variant={selectedSubTab === "tomorrow" ? "secondary" : "ghost"}
                  onClick={() => setSelectedSubTab("tomorrow")}
                  className={`rounded-full text-xs py-1 h-8 ${selectedSubTab === "tomorrow" ? "bg-white/30" : ""}`}
                >
                  Tomorrow
                </Button>
                <Button
                  variant={selectedSubTab === "10days" ? "secondary" : "ghost"}
                  onClick={() => setSelectedSubTab("10days")}
                  className={`rounded-full text-xs py-1 h-8 ${selectedSubTab === "10days" ? "bg-white/30" : ""}`}
                >
                  10 days
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/30 p-3 rounded-xl">
                  <div className="flex items-center mb-1">
                    <Wind className="h-4 w-4 mr-2" />
                    <span className="text-xs">Wind speed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">10km/h</span>
                    <span className="text-xs text-gray-600">↗ NNW</span>
                  </div>
                </Card>

                <Card className="bg-white/30 p-3 rounded-xl">
                  <div className="flex items-center mb-1">
                    <Droplets className="h-4 w-4 mr-2" />
                    <span className="text-xs">Rain chance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">24%</span>
                    <span className="text-xs text-gray-600">↓ 10%</span>
                  </div>
                </Card>

                <Card className="bg-white/30 p-3 rounded-xl">
                  <div className="flex items-center mb-1">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs">Pressure</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">753 hPa</span>
                    <span className="text-xs text-gray-600">↓ 4 hPa</span>
                  </div>
                </Card>

                <Card className="bg-white/30 p-3 rounded-xl">
                  <div className="flex items-center mb-1">
                    <Sun className="h-4 w-4 mr-2" />
                    <span className="text-xs">UV index</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">2.3</span>
                    <span className="text-xs text-gray-600">↓ 0.3</span>
                  </div>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M19.07 19.07L16.24 16.24M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Hourly forecast
                </h3>

                <div className="flex space-x-6 overflow-x-auto pb-2">
                  {["Now", "10AM", "11AM", "12PM", "1PM", "2PM"].map((time, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-xs mb-1">{time}</span>
                      {i === 0 ? <WeatherIcon /> : <Cloud className="h-6 w-6 mb-1" />}
                      <span className="font-medium">{10 - i}°</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Day forecast
                </h3>

                <div className="flex space-x-6 overflow-x-auto pb-2">
                  {["10°", "8°", "5°", "12°", "9°", "12°"].map((temp, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-xs mb-1">{i === 0 ? "10°" : `${10 - i}°`}</span>
                      {i % 2 === 0 ? <WeatherIcon /> : <Cloud className="h-6 w-6 mb-1" />}
                      <span className="font-medium">{temp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tomorrow Tab - Day Forecast with Graph */}
          <TabsContent value="tomorrow" className="mt-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-7xl font-light">3°</h1>
                  <p className="text-sm">Feels like -2°</p>
                </div>
                <div className="flex flex-col items-center">
                  <WeatherIcon size="large" />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-medium mb-4">Day forecast</h3>

                <div className="bg-white/30 rounded-xl p-4 mb-6">
                  <div className="mb-2 flex justify-between">
                    <span className="text-xs">3°</span>
                    <span className="text-xs">7°</span>
                  </div>

                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#8884d8" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-medium mb-4">Chance of rain</h3>

                  {rainData.map((item, index) => (
                    <div key={index} className="flex items-center mb-3">
                      <div className="w-12 text-xs">{item.time}</div>
                      <div className="flex-1 ml-2">
                        <div className="h-4 bg-purple-500 rounded-full" style={{ width: `${item.chance}%` }}></div>
                      </div>
                      <div className="ml-2 text-xs">{item.chance}%</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-medium mb-4">Sunrise & Sunset</h3>

                  <div className="flex justify-between bg-white/30 rounded-xl p-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xs mb-1">Sunrise</span>
                      <span className="font-medium">4:20 AM</span>
                      <span className="text-xs text-gray-600">-00:01</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-xs mb-1">Sunset</span>
                      <span className="font-medium">4:50 PM</span>
                      <span className="text-xs text-gray-600">+01:06</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 10 Days Tab */}
          <TabsContent value="10days" className="mt-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-7xl font-light">3°</h1>
                  <p className="text-sm">Feels like -2°</p>
                </div>
                <div className="flex flex-col items-center">
                  <WeatherIcon size="large" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <Button
                  variant={selectedSubTab === "today" ? "secondary" : "ghost"}
                  onClick={() => setSelectedSubTab("today")}
                  className={`rounded-full text-xs py-1 h-8 ${selectedSubTab === "today" ? "bg-white/30" : ""}`}
                >
                  Today
                </Button>
                <Button
                  variant={selectedSubTab === "tomorrow" ? "secondary" : "ghost"}
                  onClick={() => setSelectedSubTab("tomorrow")}
                  className={`rounded-full text-xs py-1 h-8 ${selectedSubTab === "tomorrow" ? "bg-white/30" : ""}`}
                >
                  Tomorrow
                </Button>
                <Button
                  variant={selectedSubTab === "10days" ? "secondary" : "ghost"}
                  onClick={() => setSelectedSubTab("10days")}
                  className={`rounded-full text-xs py-1 h-8 ${selectedSubTab === "10days" ? "bg-white/30" : ""}`}
                >
                  10 days
                </Button>
              </div>

              <div className="space-y-4">
                {tenDayForecast.map((day, index) => (
                  <div key={index} className="bg-white/30 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{day.day}</div>
                      <div className="text-xs text-gray-600">{day.condition}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2">{index % 2 === 0 ? <WeatherIcon /> : <Cloud className="h-6 w-6" />}</div>
                      <div className="text-right">
                        <div className="font-medium">{day.temp}°</div>
                        <div className="text-xs text-gray-600">{day.feelsLike}°</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

