// import React from "react";

// const About = () => {
//   return (
//     <div style={styles.container}>
//       {/* HERO SECTION */}
//       <section style={styles.hero}>
//         <h1 style={styles.title}>About Zafanana Express</h1>
//         <p style={styles.subtitle}>
//           Connecting North Eastern Kenya with safe, affordable and reliable
//           transport.
//         </p>
//       </section>

//       {/* CONTENT SECTION */}
//       <section style={styles.content}>
//         <div style={styles.text}>
//           <h2>Who We Are</h2>
//           <p>
//             Zafanana Express is a regional transport company committed to
//             providing safe, comfortable, and affordable travel across North
//             Eastern Kenya. We proudly serve routes including Garissa, Wajir,
//             Mandera, Dadaab, and surrounding regions.
//           </p>

//           <h2>Our Mission</h2>
//           <p>
//             To simplify travel by offering reliable bus services, modern booking
//             solutions, and excellent customer experience for all travelers.
//           </p>

//           <h2>Why Choose Us?</h2>
//           <ul>
//             <li>✔ Modern & well-maintained buses</li>
//             <li>✔ Experienced and professional drivers</li>
//             <li>✔ Affordable fares</li>
//             <li>✔ Easy online booking</li>
//             <li>✔ Trusted by thousands of travelers</li>
//           </ul>
//         </div>

//         {/* IMAGE GALLERY */}
//         <div style={styles.images}>
//           <img
//             src="ZF1.png"
//             alt="Zafanana Bus"
//             style={styles.image}
//           />
//           <img
//             src="ZF2.png"
//             alt="Luxury Bus Interior"
//             style={styles.image}
//           />
//           <img
//             src="ZF3.png"
//             alt="Bus on the road"
//             style={styles.image}
//           />
//         </div>
//       </section>
//     </div>
//   );
// };

// export default About;

// /* INLINE STYLES */
// const styles = {
//   container: {
//     width: "100%",
//     minHeight: "100vh",
//     backgroundColor: "#f9fafb",
//   },
//   hero: {
//     background: "linear-gradient(135deg, #0f172a, #020617)",
//     color: "#fff",
//     padding: "4rem 2rem",
//     textAlign: "center",
//   },
//   title: {
//     fontSize: "2.5rem",
//     marginBottom: "1rem",
//   },
//   subtitle: {
//     fontSize: "1.1rem",
//     maxWidth: "700px",
//     margin: "0 auto",
//     opacity: 0.9,
//   },
//   content: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "2rem",
//     padding: "3rem 2rem",
//     maxWidth: "1200px",
//     margin: "0 auto",
//   },
//   text: {
//     lineHeight: 1.7,
//   },
//   images: {
//     display: "grid",
//     gridTemplateColumns: "1fr",
//     gap: "1rem",
//   },
//   image: {
//     width: "100%",
//     height: "220px",
//     objectFit: "cover",
//     borderRadius: "12px",
//     boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
//   },
// };

import React, { useEffect, useState } from "react";
import "./about.css";

const images = [
  {
    src: "ZF1.png",
    caption: "Modern & Comfortable Coaches",
  },
  {
    src: "ZF2.png",
    caption: "Safe Travel Across North Eastern Kenya",
  },
  {
    src: "ZF3.png",
    caption: "Reliable Daily Routes",
  },
];

const About = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <h1>About Zafanana Express</h1>
        <p>
          Connecting North Eastern Kenya with safe, affordable and reliable
          transport.
        </p>
      </section>

      {/* CONTENT */}
      <section className="about-content">
        <h2>Who We Are</h2>
        <p>
          Zafanana Express is a regional transport company committed to providing
          safe, comfortable, and affordable travel across North Eastern Kenya.
          We serve Garissa, Wajir, Mandera, Dadaab and surrounding regions.
        </p>

        <h2>Our Mission</h2>
        <p>
          To simplify travel by offering reliable bus services, modern booking
          solutions and excellent customer experience.
        </p>

        <ul>
          <li>✔ Modern & well-maintained buses</li>
          <li>✔ Professional drivers</li>
          <li>✔ Affordable fares</li>
          <li>✔ Easy online booking</li>
        </ul>
      </section>

      {/* SLIDER – OVERLAPPING */}
      <section className="about-slider">
        <div className="slider-card">
          <img
            key={images[index].src}
            src={images[index].src}
            alt="Zafanana Bus"
          />
          <div className="slider-caption">
            {images[index].caption}
          </div>
        </div>

        <div className="dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={i === index ? "dot active" : "dot"}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
