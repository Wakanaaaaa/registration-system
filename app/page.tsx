"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import styles from "./page.module.css";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "4Wwords", "1", "episodes", "1"));
      console.log(docSnap.data());
    };
    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>話題選択支援研究</h1>
      <h2 className={styles.title}>エピソード入力画面</h2>

      <Link href="/input-tester-number">入力を開始する</Link>
    </main>
  );
}
