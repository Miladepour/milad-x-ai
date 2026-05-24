import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import AIWork from "@/components/home/AIWork";
import Courses from "@/components/home/Courses";
import BookCall from "@/components/home/BookCall";

export default function Home() {
  return (
    <>
      <Hero />
      <div id="about">
        <About />
      </div>
      <div id="work">
        <AIWork />
      </div>
      <div id="courses">
        <Courses />
      </div>
      <BookCall />
    </>
  );
}
