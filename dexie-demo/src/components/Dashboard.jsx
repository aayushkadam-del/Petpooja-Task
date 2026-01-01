import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LogOut,
  ShoppingCart,
  Package,
  MapPin,
  Box,
  TrendingUp,
} from "lucide-react";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Required Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  const slides = [
    {
      title: "Discover New Arrivals",
      subtitle: "Fresh styles hand-picked for you",
      img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=90&w=2400",
      cta: "Shop Now",
      path: "/marketplace",
    },
    {
      title: "Seasonal Deals Up To 60% Off",
      subtitle: "Limited time only – don't miss out",
      img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=90&w=2400",
      cta: "Explore Deals",
      path: "/marketplace",
    },
    {
      title: "Best Sellers This Week",
      subtitle: "Loved by thousands of customers",
      img: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=90&w=2400",
      cta: "View Top Picks",
      path: "/marketplace",
    },
  ];

  const quickActions =
    currentUser?.role === "admin"
      ? [
          {
            icon: Box,
            label: "Inventory",
            desc: "Manage stock & listings",
            path: "/manage-inventory",
            color: "#FF9900",
          },
          {
            icon: Package,
            label: "Add Product",
            desc: "List new items instantly",
            path: "/add-product",
            color: "#146EB4",
          },
          {
            icon: ShoppingCart,
            label: "Orders",
            desc: "Process & track orders",
            path: "/manage-orders",
            color: "#007185",
          },
          {
            icon: TrendingUp,
            label: "Analytics",
            desc: "Sales & performance insights",
            path: "/analytics",
            color: "#C7511F",
          },
        ]
      : [
          {
            icon: ShoppingCart,
            label: "Shop",
            desc: "Explore new collections",
            path: "/marketplace",
            color: "#FF9900",
          },
          {
            icon: Package,
            label: "My Cart",
            desc: "Review & checkout",
            path: "/cart",
            color: "#146EB4",
          },
          {
            icon: MapPin,
            label: "Orders",
            desc: "Track your shipments",
            path: "/orders",
            color: "#007185",
          },
        ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9fd 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header – more premium feel */}
      <header
        style={{
          background: "linear-gradient(to right, #131921, #1a2537)",
          padding: "10px 16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1480,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#FF9900",
                color: "#131921",
                fontWeight: 900,
                fontSize: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(255,153,0,0.4)",
              }}
            >
              {currentUser?.name?.charAt(0) || "S"}
            </div>
            <div>
              <div style={{ fontSize: 13, color: "#a0b0c0" }}>
                Welcome back,
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
                {currentUser?.name?.split(" ")[0] || "Shopper"} !
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#FF9900",
              color: "#0F1111",
              border: "none",
              padding: "5px 12px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(255,153,0,0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          padding: "32px 24px",
          flex: 1,
          width: "100%",
        }}
      >
        {/* Modern Hero Carousel with Swiper + fade effect */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            marginBottom: 40,
            position: "relative",
            height: "520px",
          }}
        >
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            loop
            pagination={{ clickable: true, dynamicBullets: true }}
            style={{ height: "100%" }}
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={idx}>
                <div
                  style={{
                    height: "100%",
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.38), rgba(0,0,0,0.68)), url(${slide.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    color: "white",
                    padding: "0 20px",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
                      fontWeight: 800,
                      margin: "0 0 16px",
                      textShadow: "0 4px 12px rgba(0,0,0,0.6)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {slide.title}
                  </h1>
                  <p
                    style={{
                      fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                      maxWidth: 680,
                      margin: "0 0 32px",
                      opacity: 0.95,
                    }}
                  >
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={() => navigate(slide.path)}
                    style={{
                      background: "#FF9900",
                      color: "#0F1111",
                      border: "none",
                      padding: "16px 48px",
                      fontSize: 18,
                      fontWeight: 700,
                      borderRadius: 12,
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(255,153,0,0.4)",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.06)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,153,0,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,153,0,0.4)";
                    }}
                  >
                    {slide.cta} →
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Quick Actions – nicer cards */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: "32px",
            marginBottom: 40,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#0F1111",
              margin: "0 0 32px",
            }}
          >
            Quick Actions
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
              gap: 24,
            }}
          >
            {quickActions.map((action, i) => (
              <div
                key={i}
                onClick={() => navigate(action.path)}
                style={{
                  padding: 28,
                  background: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #e0e0e0",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.22s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 16px 32px rgba(0,0,0,0.12)";
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "#e0e0e0";
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    margin: "0 auto 20px",
                    borderRadius: 16,
                    background: `${action.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <action.icon size={36} color={action.color} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0F1111", marginBottom: 8 }}>
                  {action.label}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280" }}>{action.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 32 }}>
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#0F1111",
                margin: "0 0 24px",
                paddingBottom: 16,
                borderBottom: "2px solid #f0f0f0",
              }}
            >
              Account Overview
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[
                { label: "Email Address", value: currentUser?.email || "—" },
                { label: "Phone Number", value: currentUser?.phone || "—" },
                {
                  label: "Customer Since",
                  value: currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—",
                },
                {
                  label: "Account Type",
                  value:
                    currentUser?.role === "admin" ? (
                      <span
                        style={{
                          background: "#146EB4",
                          color: "white",
                          padding: "6px 14px",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        ADMIN
                      </span>
                    ) : (
                      "Shopper"
                    ),
                },
              ].map((item, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      marginBottom: 8,
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #146EB4 0%, #0b5a8a 100%)",
              borderRadius: 16,
              padding: 32,
              color: "white",
              boxShadow: "0 10px 30px rgba(20,110,180,0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px" }}>
              Welcome back{currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.92, margin: 0 }}>
              {currentUser?.role === "admin"
                ? "Take control of your store — manage inventory, process orders, and track performance in real time."
                : "Ready for your next favorite find? Browse new arrivals, flash deals, and personalized recommendations."}
            </p>
          </div>
        </div>
      </main>

      <footer
        style={{
          background: "#0F1111",
          color: "#aaa",
          padding: "24px 16px",
          marginTop: 60,
          textAlign: "center",
          fontSize: 13,
        }}
      >
        <div style={{ maxWidth: 1480, margin: "0 auto" }}>
          © {new Date().getFullYear()} Your Store • All rights reserved.
        </div>
      </footer>
    </div>
  );
}