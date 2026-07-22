import Component from "./ui/ink-reveal";

export default function InkRevealSection() {
  return (
    <div className="section hidden md:block" style={{ paddingTop: 0 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "400px",
          overflow: "hidden",
          borderRadius: "12px",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80"
          alt="Landscape"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <Component />
      </div>
    </div>
  );
}
