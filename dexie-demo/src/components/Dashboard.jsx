import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LogOut,
  ShoppingCart,
  Package,
  MapPin,
  Box,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const [index, setIndex] = useState(0);

  const slides = [
    {
      title: "Discover New Arrivals",
      subtitle: "Hand-picked items just for you",
      img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    },
    {
      title: "Seasonal Deals",
      subtitle: "Save big on trending styles",
      img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600&q=80", // sneakers clean background
    },
    {
      title: "Shop Best Sellers",
      subtitle: "Top-rated by our customers",
      img: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0", // fashion street style
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/");
  };

  const quickActions =
    currentUser?.role === "admin"
      ? [
          {
            icon: Box,
            label: "Inventory",
            desc: "Manage products",
            path: "/manage-inventory",
            color: "#FF9900",
          },
          {
            icon: Package,
            label: "Add Product",
            desc: "Create new listing",
            path: "/add-product",
            color: "#146EB4",
          },
          {
            icon: ShoppingCart,
            label: "Orders",
            desc: "View all orders",
            path: "/manage-orders",
            color: "#007185",
          },
          {
            icon: TrendingUp,
            label: "Analytics",
            desc: "View insights",
            path: "/analytics",
            color: "#C7511F",
          },
        ]
      : [
          {
            icon: ShoppingCart,
            label: "Shop",
            desc: "Browse products",
            path: "/marketplace",
            color: "#FF9900",
          },
          {
            icon: Package,
            label: "My Cart",
            desc: "Review items",
            path: "/cart",
            color: "#146EB4",
          },
          {
            icon: MapPin,
            label: "Orders",
            desc: "Track shipments",
            path: "/orders",
            color: "#007185",
          },
        ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EAEDED",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Amazon-style Header */}
      <header style={{ background: "#131921", padding: "12px 24px" }}>
        <div
          style={{
            maxWidth: "1500px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                background: "#FF9900",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#131921",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {currentUser?.name?.charAt(0) || "S"}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#ccc" }}>
                Hello, {currentUser?.name?.split(" ")[0] || "Shopper"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                Account & Lists
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: "#FF9900",
              color: "#131921",
              border: "none",
              padding: "10px 20px",
              borderRadius: 4,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 13,
              transition: "all 0.2s",
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Secondary Header */}
      {/* <div style={{ background: "#232F3E", padding: "8px 24px", borderBottom: "1px solid #3a4553" }}>
        <div style={{ maxWidth: "1500px", margin: "0 auto", display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>All</div>
          <div style={{ color: "#fff", fontSize: 14, cursor: "pointer" }}>Today's Deals</div>
          <div style={{ color: "#fff", fontSize: 14, cursor: "pointer" }}>Customer Service</div>
          <div style={{ color: "#fff", fontSize: 14, cursor: "pointer" }}>Registry</div>
          <div style={{ color: "#fff", fontSize: 14, cursor: "pointer" }}>Gift Cards</div>
          <div style={{ color: "#fff", fontSize: 14, cursor: "pointer" }}>Sell</div>
        </div>
      </div> */}

      <main
        style={{
          width: "100%",
          maxWidth: 1500,
          margin: "0 auto",
          padding: "20px 24px",
          flex: 1,
        }}
      >
        {/* Hero Carousel */}
        <div
          style={{
            position: "relative",
            borderRadius: 0,
            overflow: "hidden",
            height: 400,
            marginBottom: 20,
          }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(₹{s.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%",
                transition: "opacity 600ms ease",
                opacity: i === index ? 1 : 0,
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <h1
                style={{
                  fontSize: 42,
                  margin: 0,
                  color: "white",
                  fontWeight: 700,
                  textAlign: "center",
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                {s.title}
              </h1>
              <p
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  color: "rgba(255,255,255,0.95)",
                  textAlign: "center",
                }}
              >
                {s.subtitle}
              </p>
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 20,
              display: "flex",
              gap: 8,
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 10,
                  background: i === index ? "#FF9900" : "rgba(255,255,255,0.6)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                aria-label={`Go to slide ₹{i+1}`}
              />
            ))}
          </div>
        </div>

        {/* Main Navigation Card - Amazon Style */}
        <div style={{ background: "white", padding: 30, marginBottom: 20 }}>
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 21,
                fontWeight: 700,
                color: "#0F1111",
                margin: 0,
              }}
            >
              Your quick actions
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(₹{quickActions.length}, 1fr)`,
              gap: 16,
            }}
          >
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                onClick={() => navigate(action.path)}
                style={{
                  padding: 20,
                  background: "#fff",
                  border: "1px solid #D5D9D9",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#C7C7C7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#D5D9D9";
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    background: `₹{action.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <action.icon size={30} style={{ color: action.color }} />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#0F1111",
                    marginBottom: 4,
                  }}
                >
                  {action.label}
                </div>
                <div style={{ fontSize: 12, color: "#565959" }}>
                  {action.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Info - Amazon Style */}
        <div
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              border: "1px solid #D5D9D9",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0F1111",
                margin: "0 0 20px 0",
                paddingBottom: 12,
                borderBottom: "1px solid #e7e7e7",
              }}
            >
              Account Details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#565959",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Email Address
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 400, color: "#0F1111" }}
                >
                  {currentUser?.email || "—"}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#565959",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Phone Number
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 400, color: "#0F1111" }}
                >
                  {currentUser?.phone || "—"}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#565959",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Customer Since
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 400, color: "#0F1111" }}
                >
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString()
                    : "—"}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#565959",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Account Type
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 400, color: "#0F1111" }}
                >
                  {currentUser?.role === "admin" ? (
                    <span
                      style={{
                        background: "#146EB4",
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: 2,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      ADMIN
                    </span>
                  ) : (
                    "Prime Member"
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#146EB4", padding: 24, color: "white" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px 0" }}>
              Welcome back
            </h3>
            <p
              style={{
                fontSize: 13,
                opacity: 0.95,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {currentUser?.role === "admin"
                ? "Manage your inventory and fulfill orders efficiently."
                : "Continue shopping where you left off and discover new deals."}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "#232F3E",
          color: "#fff",
          padding: "40px 24px",
          marginTop: 40,
        }}
      >
        <div style={{ maxWidth: 1500, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#DDD" }}>
            © 2024 Your Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
