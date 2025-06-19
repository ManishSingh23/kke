import React, { useState, useEffect } from "react";

const KrishnaKavachWebsite = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    products: [],
    message: "",
    website: "", // honeypot
  });
  const [formStatus, setFormStatus] = useState({
    type: "",
    message: "",
    visible: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-select component state and handlers
  const allProducts = [
    { id: "bellow-covers", name: "Bellow Covers" },
    { id: "telescopic-covers", name: "Telescopic Covers" },
    { id: "apron-covers", name: "Apron Covers" },
    { id: "roll-away-covers", name: "Roll-Away Covers" },
    { id: "rubber-components", name: "Rubber Components" },
    { id: "rubber-buffers", name: "Rubber Buffers" },
    { id: "rubber-grommets", name: "Rubber Grommets" },
    { id: "rubber-seals", name: "Rubber Seals" },
    { id: "o-rings", name: "O-Rings" },
    { id: "bushes-grommets", name: "Bushes & Grommets" },
    { id: "rubber-pads", name: "Rubber Pads" },
    { id: "foundation-sheets", name: "Foundation Sheets" },
    { id: "way-wipers", name: "Way Wipers" },
    { id: "chip-conveyors", name: "Chip Conveyors" },
    { id: "all-products", name: "All Products" },
  ];

  const [selectedProductItems, setSelectedProductItems] = useState([]);
  const [availableProductItems, setAvailableProductItems] =
    useState(allProducts);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);

      // Update active section
      const sections = ["home", "about", "services", "projects", "contact"];
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });
      if (currentSection) setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");

            // Animate stats
            if (entry.target.classList.contains("stat-item")) {
              const statNumber = entry.target.querySelector(".stat-number");
              if (statNumber && statNumber.dataset.count) {
                animateNumber(statNumber, parseInt(statNumber.dataset.count));
              }
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    // Observe all fade-in elements
    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const animateNumber = (element, finalNumber) => {
    const duration = 2000;
    const increment = finalNumber / (duration / 16);
    let currentNumber = 0;

    const timer = setInterval(() => {
      currentNumber += increment;
      if (currentNumber >= finalNumber) {
        element.textContent = finalNumber + "+";
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(currentNumber) + "+";
      }
    }, 16);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const moveToSelected = (items) => {
    const itemsToMove = Array.isArray(items) ? items : [items];
    setSelectedProductItems((prev) => [...prev, ...itemsToMove]);
    setAvailableProductItems((prev) =>
      prev.filter(
        (item) => !itemsToMove.some((moveItem) => moveItem.id === item.id)
      )
    );

    // Update form data
    const newSelectedIds = [
      ...selectedProductItems.map((item) => item.id),
      ...itemsToMove.map((item) => item.id),
    ];
    setFormData((prev) => ({ ...prev, products: newSelectedIds }));
  };

  const moveToAvailable = (items) => {
    const itemsToMove = Array.isArray(items) ? items : [items];
    setAvailableProductItems((prev) => [...prev, ...itemsToMove]);
    setSelectedProductItems((prev) =>
      prev.filter(
        (item) => !itemsToMove.some((moveItem) => moveItem.id === item.id)
      )
    );

    // Update form data
    const newSelectedIds = selectedProductItems
      .filter(
        (item) => !itemsToMove.some((moveItem) => moveItem.id === item.id)
      )
      .map((item) => item.id);
    setFormData((prev) => ({ ...prev, products: newSelectedIds }));
  };

  const moveAllToSelected = () => {
    moveToSelected(availableProductItems);
  };

  const moveAllToAvailable = () => {
    moveToAvailable(selectedProductItems);
  };

  const handleSubmit = async () => {
    // Honeypot check
    if (formData.website) {
      return;
    }

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      setFormStatus({
        type: "error",
        message: "Please fill in all required fields.",
        visible: true,
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormStatus({
        type: "error",
        message: "Please enter a valid email address.",
        visible: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Production API call to Vercel serverless function
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          products: selectedProductItems.map((item) => item.name),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFormStatus({
          type: "success",
          message:
            result.message ||
            `Thank you ${formData.name}! Your message has been sent successfully. We'll contact you soon at ${formData.phone}. 🚀 Stay tuned for our magical launch!`,
          visible: true,
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          products: [],
          message: "",
          website: "",
        });
        setSelectedProductItems([]);
        setAvailableProductItems(allProducts);
      } else {
        setFormStatus({
          type: "error",
          message:
            result.message || "Failed to send message. Please try again.",
          visible: true,
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormStatus({
        type: "error",
        message:
          "Unable to send email at the moment. Please contact us directly at admin@krishnakavach.com or call +91 8860838343.",
        visible: true,
      });
    } finally {
      setIsSubmitting(false);
    }

    // Hide message after 5 seconds
    setTimeout(() => {
      setFormStatus((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content */}
      <a
        href="#main"
        className="absolute -top-10 left-0 bg-blue-600 text-white px-2 py-1 z-50 focus:top-0 transition-all"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4 ${
          isScrolled ? "bg-white/95 backdrop-blur-sm shadow-lg py-2" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white text-xl">
              🛡️
            </div>
            <div>
              <h1
                className={`text-xl font-bold transition-colors ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
              >
                Krishna Kavach
              </h1>
              <p
                className={`text-sm transition-colors ${
                  isScrolled ? "text-gray-600" : "text-white/80"
                }`}
              >
                Engineering
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About" },
              { id: "services", label: "Services" },
              { id: "projects", label: "Products" },
              { id: "contact", label: "Contact" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`font-medium transition-colors relative ${
                  isScrolled
                    ? "text-gray-700 hover:text-blue-600"
                    : "text-white hover:text-blue-300"
                } ${
                  activeSection === item.id
                    ? "after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-0.5 after:bg-blue-600"
                    : ""
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection("contact")}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Get Quote
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden text-2xl ${
              isScrolled ? "text-gray-700" : "text-white"
            }`}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white shadow-lg mt-2 py-4">
            {[
              { id: "home", label: "Home" },
              { id: "about", label: "About" },
              { id: "services", label: "Services" },
              { id: "projects", label: "Products" },
              { id: "contact", label: "Contact" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-8 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
              >
                {item.label}
              </button>
            ))}
            <div className="px-8 pt-3">
              <button
                onClick={() => scrollToSection("contact")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Get Quote
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main id="main">
        {/* Hero Section */}
        <section
          id="home"
          className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-800 to-slate-900 flex items-center relative overflow-hidden"
        >
          {/* Floating Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/10 w-24 h-24 bg-blue-500/10 rounded-full animate-pulse"></div>
            <div className="absolute top-3/5 right-1/6 w-16 h-16 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-2/5 left-3/5 w-20 h-20 bg-blue-400/10 rounded-full animate-pulse delay-2000"></div>
          </div>

          <div className="max-w-6xl mx-auto px-8 z-10 relative">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce">
              ✨ Launching Soon – Something Magical! ✨
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              We Build{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Protection
              </span>{" "}
              For Your Machines
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Get ready… something magical is launching soon! Established in
              2000 in Faridabad, Haryana, Krishna Kavach is a pioneering name in
              machine protection solutions with decades of experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("services")}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Explore Products
                <span>→</span>
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all"
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: 25, label: "Years Experience" },
                { number: 1000, label: "Happy Clients" },
                { number: 13, label: "Product Categories" },
                { label: "24/7 Support Available", isText: true },
              ].map((stat, index) => (
                <div key={index} className="text-center stat-item fade-in">
                  <div
                    className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 stat-number"
                    data-count={stat.number}
                  >
                    {stat.isText ? "24/7" : "0"}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="fade-in">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  About Krishna Kavach
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Established in the year 2000 in Faridabad, Haryana, Krishna
                  Kavach is a pioneering name in machine protection solutions.
                  With decades of experience, we build more than just products —
                  we build protection for your machines.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  We're working on a revolutionary launch that will transform
                  industrial protection. Stay connected — it's coming soon and
                  it's going to be magical!
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Established in 2000 in Faridabad, Haryana",
                    "Decades of Experience in Machine Protection",
                    "Comprehensive Range of Protection Solutions",
                    "Innovative Products & Revolutionary Technology",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-gray-600"
                    >
                      <span className="text-green-500 text-xl">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => scrollToSection("contact")}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Contact Us Today
                </button>
              </div>

              <div className="fade-in">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
                  <div className="grid md:grid-cols-1 gap-8">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎯</div>
                      <h3 className="text-xl font-semibold mb-2">
                        Our Mission
                      </h3>
                      <p className="text-blue-100">
                        To provide innovative machine protection solutions that
                        ensure safety and efficiency
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-4">🌍</div>
                      <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                      <p className="text-blue-100">
                        To be the leading machine protection partner for
                        industries worldwide
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Machine Protection Solutions
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We manufacture and supply a comprehensive range of machine
                protection products, built with decades of experience and
                innovation.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🛡️",
                  title: "Bellow & Telescopic Covers",
                  description:
                    "Premium quality bellow covers and telescopic covers for comprehensive machine protection and safety. Durable apron covers and roll-away covers designed for optimal machine performance and longevity.",
                },
                {
                  icon: "🏭",
                  title: "Rubber Components",
                  description:
                    "Complete range of rubber buffers, grommets, seals, O-rings, bushes, pads, and foundation sheets. High-quality components engineered for durability and optimal performance.",
                },
                {
                  icon: "🔧",
                  title: "Way Wipers & Conveyors",
                  description:
                    "High-quality way wipers and chip conveyors for enhanced machine efficiency and cleanliness. Engineered solutions for optimal operational performance.",
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer fade-in"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-2 group"
                  >
                    Learn More
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Product Portfolio
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Showcasing our comprehensive range of machine protection
                solutions, manufactured with precision and decades of expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  category: "Protection Covers",
                  title: "Bellow & Telescopic Covers",
                  description:
                    "Premium quality machine protection covers designed for optimal safety and performance in industrial environments.",
                  color: "from-blue-600 to-blue-800",
                },
                {
                  category: "Rubber Components",
                  title: "Seals, O-Rings & Grommets",
                  description:
                    "Complete range of rubber components including seals, O-rings, bushes, grommets, and foundation sheets.",
                  color: "from-green-600 to-green-800",
                },
                {
                  category: "Industrial Solutions",
                  title: "Way Wipers & Chip Conveyors",
                  description:
                    "Advanced way wipers and chip conveyors for enhanced machine efficiency and optimal operational cleanliness.",
                  color: "from-purple-600 to-purple-800",
                },
              ].map((project, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in"
                >
                  <div
                    className={`h-48 bg-gradient-to-br ${project.color} flex items-center justify-center text-white text-4xl`}
                  >
                    {index === 0 ? "🛡️" : index === 1 ? "⚙️" : "🏭"}
                  </div>
                  <div className="p-6">
                    <div className="text-sm font-semibold text-blue-600 mb-2">
                      {project.category}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-2 group"
                    >
                      View Details
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Be the First to Know
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We're working on a revolutionary launch that will transform
                industrial protection. Stay connected — it's coming soon and
                it's going to be magical!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8 fade-in">
                {[
                  {
                    icon: "📞",
                    title: "Call Us Now",
                    subtitle: "Support Team",
                    detail: "+91 8860838343",
                  },
                  {
                    icon: "✉️",
                    title: "Email",
                    subtitle: "For all inquiries and support",
                    detail: "admin@krishnakavach.com",
                  },
                  {
                    icon: "📍",
                    title: "Location",
                    subtitle: "Established since 2000",
                    detail: "Faridabad, Haryana",
                  },
                ].map((contact, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                      {contact.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {contact.title}
                      </h3>
                      <p className="text-gray-600 mb-1">{contact.subtitle}</p>
                      <p className="font-medium text-gray-900">
                        {contact.detail}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-6 rounded-xl text-center">
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="text-lg font-semibold mb-2">Launching Soon</h3>
                  <p className="text-purple-100">
                    Stay Tuned with Krishna Kavach!
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gray-50 p-8 rounded-xl fade-in">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Get In Touch
                </h3>

                <div className="space-y-6">
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleFormChange}
                    className="absolute left-[-9999px]"
                    autoComplete="off"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Products Interested In
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
                      {/* Available Products */}
                      <div className="md:col-span-2 border border-gray-200 rounded-lg p-3 bg-white">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                          📦 Available Products ({availableProductItems.length})
                        </h4>
                        <div className="h-48 overflow-y-auto space-y-2">
                          {availableProductItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md"
                              onClick={() => moveToSelected(item)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">→</span>
                                <span className="font-medium text-gray-800">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          ))}
                          {availableProductItems.length === 0 && (
                            <div className="text-gray-400 text-sm text-center py-8 italic">
                              All products selected! 🎉
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex md:flex-col flex-row justify-center items-center space-y-3 md:space-y-3 md:space-x-0 space-x-3 px-2">
                        <div className="flex md:flex-col flex-row gap-2">
                          <button
                            type="button"
                            onClick={moveAllToSelected}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            disabled={availableProductItems.length === 0}
                            title="Move all to selected"
                          >
                            ≫
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (availableProductItems.length > 0) {
                                moveToSelected(availableProductItems[0]);
                              }
                            }}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            disabled={availableProductItems.length === 0}
                            title="Move first item to selected"
                          >
                            →
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedProductItems.length > 0) {
                                moveToAvailable(selectedProductItems[0]);
                              }
                            }}
                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            disabled={selectedProductItems.length === 0}
                            title="Move first selected item back"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={moveAllToAvailable}
                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            disabled={selectedProductItems.length === 0}
                            title="Move all back to available"
                          >
                            ≪
                          </button>
                        </div>
                      </div>

                      {/* Selected Products */}
                      <div className="md:col-span-2 border border-green-200 rounded-lg p-3 bg-white">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                          ✅ Selected Products ({selectedProductItems.length})
                        </h4>
                        <div className="h-48 overflow-y-auto space-y-2">
                          {selectedProductItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 text-sm bg-green-50 hover:bg-green-100 cursor-pointer rounded-lg border border-green-200 transition-all duration-200 hover:shadow-md"
                              onClick={() => moveToAvailable(item)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                <span className="font-medium text-gray-800">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          ))}
                          {selectedProductItems.length === 0 && (
                            <div className="text-gray-400 text-sm text-center py-8 italic">
                              Click items to select them 👆
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                      💡 <strong>How to use:</strong> Click on any product to
                      move it between lists, or use the arrow buttons. Selected
                      products (✅) will be included in your inquiry.
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting && (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                  </button>
                </div>

                {/* Form Message */}
                {formStatus.visible && (
                  <div
                    className={`mt-4 p-4 rounded-lg text-center ${
                      formStatus.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <span className="mr-2">
                      {formStatus.type === "success" ? "✅" : "⚠️"}
                    </span>
                    {formStatus.message}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                  <p className="text-blue-800 font-medium text-center">
                    🚀 Something magical is launching soon! Be the first to know
                    about our revolutionary products.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Created By Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-800 to-purple-800 py-20 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/10 text-blue-400/30 font-mono text-sm animate-pulse">
              &lt;div&gt;
            </div>
            <div className="absolute top-2/5 right-1/6 text-purple-400/30 font-mono text-sm animate-pulse delay-1000">
              function()
            </div>
            <div className="absolute top-3/5 left-1/5 text-blue-300/30 font-mono text-sm animate-pulse delay-2000">
              {"{code}"}
            </div>
            <div className="absolute top-4/5 right-1/4 text-purple-300/30 font-mono text-sm animate-pulse delay-3000">
              &lt;/div&gt;
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/30 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              💻 ✨ Crafted with Passion ✨
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Built with{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Innovation
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              This website represents more than just code – it's a blend of
              creativity, technology, and dedication to excellence. Every pixel,
              every interaction, every animation has been carefully crafted to
              deliver an exceptional experience.
            </p>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[
                {
                  icon: "📱",
                  title: "Responsive Design",
                  text: "Perfectly optimized for all devices and screen sizes",
                },
                {
                  icon: "🚀",
                  title: "Performance Optimized",
                  text: "Lightning-fast loading and smooth animations",
                },
                {
                  icon: "🛡️",
                  title: "Secure & Reliable",
                  text: "Built with security best practices and reliability in mind",
                },
                {
                  icon: "🎨",
                  title: "Modern UI/UX",
                  text: "Contemporary design that engages and delights users",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:-translate-y-1 transition-all"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-white font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 text-sm">{feature.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"></div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  M
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    Created by Mannu
                  </div>
                  <div className="text-blue-300">
                    Full-Stack Developer & Designer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-lg">
                  🛡️
                </div>
                <div>
                  <h4 className="font-bold">Krishna Kavach</h4>
                  <p className="text-gray-400 text-sm">Engineering</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Established in 2000 in Faridabad, Haryana. We build more than
                just products — we build protection for your machines. Something
                magical is launching soon!
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Our Products</h4>
              <ul className="space-y-2 text-sm">
                {[
                  "Bellow Covers",
                  "Telescopic Covers",
                  "Apron Covers",
                  "Roll-Away Covers",
                  "Rubber Components",
                  "Way Wipers",
                  "Chip Conveyors",
                ].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection("services")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Rubber Components</h4>
              <ul className="space-y-2 text-sm">
                {[
                  "Rubber Buffers",
                  "Rubber Grommets",
                  "Rubber Seals",
                  "O-Rings",
                  "Bushes & Grommets",
                  "Rubber Pads",
                  "Foundation Sheets",
                ].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection("services")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                {[
                  "Contact Us",
                  "Technical Support",
                  "Documentation",
                  "Privacy Policy",
                ].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; 2025 Krishna Kavach - Established 2000 | Faridabad, Haryana
              | Contact: +91 8860838343 | 🚀 Launching Soon!
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/918860838343"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all z-50"
        aria-label="Chat on WhatsApp"
      >
        💬
      </a>

      {/* Global Styles */}
      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }
        .fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default KrishnaKavachWebsite;
