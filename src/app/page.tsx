import { Hero } from "@/components/sections/Hero";
import { Servicios } from "@/components/sections/Servicios";
import { Estadisticas } from "@/components/sections/Estadisticas";
import { Testimonios } from "@/components/sections/Testimonios";
import { Contacto } from "@/components/sections/Contacto";

export default function Home() {
  return (
    <>
      <Hero />
      <Servicios />
      <Estadisticas />
      <Testimonios />
      <Contacto />
    </>
  );
}
