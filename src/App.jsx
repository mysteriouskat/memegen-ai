import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, Sun, Moon, HelpCircle, X } from "lucide-react"

export default function MemeGenerator() {
  const [darkMode, setDarkMode] = useState(false)
  const [memePrompt, setMemePrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("no-template")
  const [selectedStyle, setSelectedStyle] = useState("classic")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedMemeUrl, setGeneratedMemeUrl] = useState("")
  const [memeTemplates, setMemeTemplates] = useState([])
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)
  const [showHelpPopup, setShowHelpPopup] = useState(false)

  useEffect(() => {
    // Fetch meme templates when component mounts
    fetch("https://api.imgflip.com/get_memes")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMemeTemplates(data.data.memes.slice(0, 20)) // Limit to first 20 templates
        }
      })
      .catch((error) => console.error("Error fetching meme templates:", error))
  }, [])

  const handleGenerate = async () => {
    if (!memePrompt.trim()) return

    setIsLoading(true)
    setGeneratedMemeUrl("")

    try {
      const res = await fetch("https://mememind-backend-production.up.railway.app/generate_meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text:
            selectedTemplate !== "no-template" ? `Use the "${selectedTemplate}" template: ${memePrompt}` : memePrompt,
          type: selectedStyle,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setGeneratedMemeUrl(data.url)
      } else {
        alert(data.msg || "Failed to generate meme")
      }
    } catch (err) {
      alert("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (generatedMemeUrl) {
      try {
        const response = await fetch(generatedMemeUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "generated-meme.jpg"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        // Fallback to opening in new tab if download fails
        window.open(generatedMemeUrl, "_blank")
      }
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.name)
    setShowTemplateDropdown(false)
    if (template.name !== "no-template") {
      setMemePrompt(`Use the "${template.name}" template with the following text: `)
    } else {
      setMemePrompt("")
    }
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-black text-white" : "bg-white text-black"
        }`}
    >
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Left Sidebar - Mobile: Top Bar, Desktop: Fixed Sidebar */}
        <div
          className={`lg:w-96 lg:fixed lg:left-0 lg:top-0 lg:h-full ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
            } border-b lg:border-r lg:border-b-0 transition-colors duration-300`}
        >
          <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 lg:overflow-y-auto lg:h-full">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-md flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold text-lg">M</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold">MemegenAI</h1>
              </div>

              {/* Theme Toggle and Help Button */}
              <div className="flex items-center space-x-3 relative">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHelpPopup(!showHelpPopup)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>

                  {showHelpPopup && (
                    <div className="absolute top-10 right-0 z-50">
                      <Card
                        className={`w-75 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} rounded-md shadow-lg`}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-bold ${darkMode ? "text-white" : "text-black"}`}>
                              Tips & Guide
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowHelpPopup(false)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
                            >
                              <X className={`w-4 h-4 ${darkMode ? "text-white" : "text-black"}`} />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                                Pro Tip
                              </h4>
                              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Type the context into the prompt box, select a template (optional), and choose a style and hit generate!
                              </p>
                            </div>
                            <div>
                              <h4 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-black"}`}>
                                Style Guide
                              </h4>
                              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Classic style works great for traditional memes, while Dank style is perfect for modern
                                internet humor
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Prompt Input with Template Dropdown */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Meme Prompt</label>
              <div className="relative">
                <textarea
                  value={memePrompt}
                  onChange={(e) => setMemePrompt(e.target.value)}
                  placeholder="Describe your meme idea..."
                  className={`w-full h-24 lg:h-32 p-4 pr-12 rounded-md border resize-none transition-all duration-200 ${darkMode
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 hover:border-gray-500"
                    : "bg-white border-gray-300 text-black placeholder-gray-500 focus:border-gray-400 hover:border-gray-400"
                    } focus:outline-none`}
                />
                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  {showTemplateDropdown && (
                    <div
                      className={`absolute top-8 right-0 w-80 max-h-60 overflow-y-auto rounded-md border shadow-lg z-10 ${darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"
                        }`}
                    >
                      <div
                        className={`p-3 cursor-pointer transition-all duration-200 flex items-center space-x-3 ${darkMode
                          ? "hover:bg-gray-700 text-white hover:text-white"
                          : "hover:bg-gray-100 hover:text-black"
                          }`}
                        onClick={() => handleTemplateSelect({ name: "no-template" })}
                      >
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-md flex items-center justify-center">
                          <span className="text-xs font-medium">None</span>
                        </div>
                        <span>No template</span>
                      </div>
                      {memeTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-3 cursor-pointer transition-all duration-200 flex items-center space-x-3 ${darkMode
                            ? "hover:bg-gray-700 text-white hover:text-white"
                            : "hover:bg-gray-100 hover:text-black"
                            }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <img
                            src={template.url || "/placeholder.svg"}
                            alt={template.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <span className="text-sm">{template.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Style Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Style</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setSelectedStyle("classic")}
                  className={`h-12 flex items-center justify-center space-x-2 transition-all duration-200 rounded-md transform hover:scale-105 ${selectedStyle === "classic"
                    ? darkMode
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-black text-white hover:bg-gray-800"
                    : darkMode
                      ? "bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
                      : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  <span className="font-medium">Classic</span>
                </Button>
                <Button
                  onClick={() => setSelectedStyle("dank")}
                  className={`h-12 flex items-center justify-center space-x-2 transition-all duration-200 rounded-md transform hover:scale-105 ${selectedStyle === "dank"
                    ? darkMode
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-black text-white hover:bg-gray-800"
                    : darkMode
                      ? "bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
                      : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  <span className="font-medium">Dank</span>
                </Button>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!memePrompt.trim() || isLoading}
              className={`w-full h-12 font-semibold text-lg rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group ${darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-5 h-5 border-2 ${darkMode ? "border-black border-t-transparent" : "border-white border-t-transparent"} rounded-full animate-spin`}
                  ></div>
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Meme"
              )}
            </Button>
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 lg:ml-96 p-4 lg:p-6 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Preview Area */}
            <Card
              className={`flex-1 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
                } transition-colors duration-300 overflow-hidden rounded-md`}
            >
              <div className="p-4 lg:p-6 h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center rounded-md overflow-hidden">
                  {isLoading ? (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center ${darkMode ? "bg-gray-800" : "bg-gray-100"
                        } rounded-md`}
                    >
                      <div
                        className={`w-16 h-16 border-4 ${darkMode ? "border-white border-t-transparent" : "border-black border-t-transparent"
                          } rounded-full animate-spin mb-4`}
                      ></div>
                      <p className="text-lg font-medium">Creating your meme...</p>
                      <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        This might take a few seconds
                      </p>
                    </div>
                  ) : generatedMemeUrl ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={generatedMemeUrl || "/placeholder.svg"}
                        alt="Generated Meme"
                        className="max-w-full max-h-full object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center ${darkMode ? "bg-gray-800" : "bg-gray-100"
                        } rounded-md`}
                    >
                      <div className="text-center">
                        <div
                          className={`w-24 h-24 mx-auto mb-6 ${darkMode ? "bg-white text-black" : "bg-black text-white"
                            } rounded-full flex items-center justify-center`}
                        >
                          <span className="text-4xl font-bold">M</span>
                        </div>
                        <h3 className={`text-xl lg:text-2xl font-bold mb-3 ${darkMode ? "text-white" : "text-black"}`}>
                          Ready to create magic?
                        </h3>
                        <p className={`text-base lg:text-lg mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          Enter your prompt and hit generate
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Your meme will appear here in seconds
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                {generatedMemeUrl && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={handleDownload}
                      className={`px-8 py-3 font-semibold rounded-md transition-all duration-200 transform hover:scale-105 ${darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                        }`}
                    >
                      Download Meme
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
