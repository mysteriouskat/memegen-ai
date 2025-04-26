// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect, useRef } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';


const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [memePrompt, setMemePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [isLoading, setIsLoading] = useState(false);
  const [memeTemplates, setMemeTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage for session persistence
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [generatedMemeUrl, setGeneratedMemeUrl] = useState('');

  useEffect(() => {
    // Fetch meme templates when component mounts
    fetch('https://api.imgflip.com/get_memes')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setMemeTemplates(data.data.memes);
        }
      })
      .catch(error => console.error('Error fetching meme templates:', error));
  }, []);

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMemePrompt('');
    setSelectedStyle('classic');
    setShowTemplates(false);
  };

  const handleGenerate = async () => {
    setIsLoading(true); // Add this at start
    setGeneratedMemeUrl(''); // Clear previous meme  
    try {
      const res = await fetch('http://127.0.0.1:8000/generate_meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: memePrompt, type: selectedStyle }),
      });
      const data = await res.json();
      if (res.ok) {
        // Show the generated meme image
        setGeneratedMemeUrl(data.url);
      } else {
        alert(data.msg || 'Failed to generate meme');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsLoading(false); // Add this at end
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleTemplateClick = (template) => {
    setMemePrompt(`Use the "${template.name}" template with the following text: ${memePrompt}`);
    setShowTemplates(false);
  };

  const handleAuthClick = () => {
    setShowLogin(true);
  };

  const handleCloseAuth = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  // Handle login/signup success
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
    setShowSignup(false);
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className={`relative min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`fixed w-full z-40 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-colors duration-300`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <i className="fas fa-laugh-squint text-3xl text-purple-600"></i>
              <h1 className="text-2xl font-bold">MemeMind</h1>
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="#" className="font-medium hover:text-purple-600 transition-colors duration-200 cursor-pointer">Home</a>
              <a href="#" className="font-medium hover:text-purple-600 transition-colors duration-200 cursor-pointer">About</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full cursor-pointer focus:outline-none !rounded-button whitespace-nowrap"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <i className="fas fa-sun text-yellow-400 text-xl"></i>
                ) : (
                  <i className="fas fa-moon text-blue-800 text-xl"></i>
                )}
              </button>
              {user ? (
                <div className="relative group">
                  <button className="p-0 border-2 border-purple-600 rounded-full focus:outline-none" aria-label="User menu">
                    <img src={user.selectedLogo} alt="User avatar" className="w-10 h-10 rounded-full object-cover" />
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{user.username}</div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className={`hidden md:block py-2 px-4 rounded-lg font-medium ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700'} transition-colors duration-200 cursor-pointer !rounded-button whitespace-nowrap`}
                >
                  Sign In
                </button>
              )}
              <button className="md:hidden cursor-pointer">
                <i className={`fas fa-bars text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (z-10) */}
      <main className="z-10 relative">
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
          <div
            className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage: `url('https://readdy.ai/api/search-image?query=A%20playful%20abstract%20pattern%20with%20tiny%20meme-related%20symbols%20and%20emojis%20scattered%20across%20a%20light%20gradient%20background.%20The%20pattern%20includes%20small%20laugh%20emojis%2C%20speech%20bubbles%2C%20and%20simple%20iconic%20meme%20elements%20creating%20a%20subtle%20texture%20perfect%20for%20a%20website%20background.&width=1440&height=800&seq=5&orientation=landscape')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  <span className="block">AI that</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Memes the Moment</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">
                  Enter any topic. Get a meme instantly. Share the laughter.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                  <button
                    onClick={handleGenerateClick}
                    className="py-3 px-8 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg cursor-pointer !rounded-button whitespace-nowrap">
                    Generate a Meme
                  </button>
                  <button className={`py-3 px-8 rounded-lg font-medium border-2 ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'} transition-all duration-300 transform hover:-translate-y-1 cursor-pointer !rounded-button whitespace-nowrap`}>
                    How It Works
                  </button>
                </div>
              </div>
              <div className="md:w-1/2">
                <img
                  src="https://readdy.ai/api/search-image?query=A%20modern%203D%20illustration%20of%20a%20smartphone%20or%20device%20displaying%20a%20meme%20generator%20interface%20with%20colorful%20UI%20elements.%20The%20device%20is%20surrounded%20by%20floating%20meme%20elements%2C%20emojis%2C%20and%20speech%20bubbles%20in%20a%20playful%20arrangement%20on%20a%20clean%20light%20background%20with%20subtle%20gradient.&width=700&height=600&seq=6&orientation=portrait"
                  alt="MemeMind AI Meme Generator"
                  className="w-full h-auto rounded-xl shadow-2xl transform hover:rotate-2 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Features</h2>
              <p className="text-xl opacity-80 max-w-3xl mx-auto">
                Powerful tools to create and customize your memes
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="text-purple-600 mb-4">
                  <i className="fas fa-magic text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">AI Generation</h3>
                <p className="opacity-80">Advanced AI algorithms to generate relevant and trending memes from any prompt.</p>
                <button className="mt-4 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 !rounded-button whitespace-nowrap">
                  Try Now
                </button>
              </div>
              <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="text-purple-600 mb-4">
                  <i className="fas fa-layer-group text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Template Library</h3>
                <p className="opacity-80">Access thousands of premium meme templates, updated daily with trending formats.</p>
                <button className="mt-4 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 !rounded-button whitespace-nowrap">
                  Browse Library
                </button>
              </div>
              <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="text-purple-600 mb-4">
                  <i className="fas fa-share-alt text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Easy Sharing</h3>
                <p className="opacity-80">Direct integration with social media platforms for instant sharing and scheduling.</p>
                <button className="mt-4 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 !rounded-button whitespace-nowrap">
                  Connect Accounts
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`} id="about">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">About MemeMind</h2>
              <p className="text-xl opacity-80 max-w-3xl mx-auto">
                MemeMind is your AI-powered meme creation companion. Instantly turn your ideas into hilarious, shareable memes with just a prompt and a click. Whether you want classic or dank styles, MemeMind brings your humor to life with cutting-edge AI, a beautiful interface, and seamless sharing. Join a vibrant community of creators, marketers, and meme lovers, and let your creativity go viral!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Meme Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`relative w-full max-w-4xl p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer">
              <i className="fas fa-times text-xl"></i>
            </button>
            <h2 className="text-3xl font-bold mb-8 text-center">Create Your Meme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium text-lg">Enter Your Prompt</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">

                      <input
                        type="text"
                        value={memePrompt}
                        onChange={(e) => setMemePrompt(e.target.value)}
                        placeholder="Describe your meme idea..."
                        className={`w-full py-3 px-4 rounded-lg text-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="py-3 px-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200"
                      aria-label="Show meme suggestions"
                    >
                      <i className="fas fa-lightbulb text-xl"></i>
                    </button>
                    {showTemplates && (
                      <div className={`absolute mt-2 w-full max-h-60 overflow-y-auto rounded-lg shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border border-gray-200 z-50`}>
                        {memeTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleTemplateClick(template)}
                            className={`w-full px-4 py-2 text-left hover:bg-purple-100 flex items-center space-x-3 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-purple-50'}`}
                          >
                            <img src={template.url} alt={template.name} className="w-12 h-12 object-cover rounded" />
                            <span>{template.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-lg">Choose Style</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedStyle('classic')}
                      className={`p-4 rounded-lg flex flex-col items-center ${selectedStyle === 'classic' ? 'bg-purple-600 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-300 transform hover:-translate-y-1 !rounded-button whitespace-nowrap`}
                    >
                      <i className="fas fa-star text-2xl mb-2"></i>
                      <span>Classic</span>
                    </button>
                    <button
                      onClick={() => setSelectedStyle('dank')}
                      className={`p-4 rounded-lg flex flex-col items-center ${selectedStyle === 'dank' ? 'bg-purple-600 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-300 transform hover:-translate-y-1 !rounded-button whitespace-nowrap`}
                    >
                      <i className="fas fa-fire text-2xl mb-2"></i>
                      <span>Dank</span>
                    </button>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleCloseModal}
                    className={`flex-1 py-3 px-6 rounded-lg text-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-300 transform hover:-translate-y-1 !rounded-button whitespace-nowrap`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg text-lg hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 !rounded-button whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="aspect-w-1 aspect-h-1 flex items-center justify-center p-6">
                  {isLoading ? (
                    // Show loading spinner
                    <div className="flex items-center justify-center h-full">
                      <i className="fas fa-spinner fa-spin text-3xl text-purple-500"></i>
                    </div>
                  ) : generatedMemeUrl ? (
                    <img src={generatedMemeUrl} alt="Generated Meme" className="max-w-full max-h-80 rounded-lg shadow-lg mx-auto" />
                  ) : (
                    <div className="text-center w-full">
                      <i className="fas fa-image text-6xl mb-4 text-purple-500"></i>
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Your meme preview will appear here
                        </p>
                        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Choose a style and enter your prompt to get started
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      {showLogin && (
        <Login
          darkMode={darkMode}
          onClose={handleCloseAuth}
          onSwitchToSignup={switchToSignup}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      {showSignup && (
        <Signup
          darkMode={darkMode}
          onClose={handleCloseAuth}
          onSwitchToLogin={switchToLogin}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default App;