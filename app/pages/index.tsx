import TopNavbar from "@/src/UI/Navbar";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>DONPO</title>
        <link rel="icon" href="/Crocerossa.png" />
        <style />
      </Head>
      <main>
        <TopNavbar />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            gap: "3vh",
          }}
        >
          <h1>BENVENUTI SU DONPO</h1>
          <h4>Connetti wallet per iniziare</h4>
        </div>
      </main>
    </>
  );
}
