"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import styles from "./page.module.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home({ params }: { params: { testerNumber: string } }) {
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "4Wwords", "1", "episodes", "1"));
      console.log(docSnap.data());
    };
    fetchData();
  }, []);

  const onSubmit = (e: any) => {
    e.preventDefault();
    console.log("submit");
    // router.push("/input-episodes");
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>話題選択支援研究</h1>
      <h2 className={styles.title}>被験者番号:{params.testerNumber}</h2>

      {/* エピソードを入力 */}
      <form action="post" onSubmit={onSubmit} className={styles.form}>
        <div className={styles.input}>
          <label htmlFor="when" className={styles.label}>いつ</label>
          <input id="when" type="text" />
        </div>

        <div className={styles.input}>
          <label htmlFor="where">どこで</label>
          <input id="where" type="text" />
        </div>

        <div className={styles.input}>
          <label htmlFor="who" className={styles.label}>誰と</label>
          <input id="who" type="text" />
        </div>

        <div className={styles.input}>
          <label htmlFor="what" className={styles.label}>何を</label>
          <input id="what" type="text" />
        </div>

        <br />

        <button type="submit">登録</button>
      </form>
    </main>
  );
}
