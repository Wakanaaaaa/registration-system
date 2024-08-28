"use client";
import { getDoc, doc, addDoc, collection } from "firebase/firestore";
import { db } from "@/app/firebase";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Episode {
  when: string;
  where: string;
  who: string;
  what: string;
}

export default function Home({ params }: { params: { testerNumber: string } }) {
  const router = useRouter();
  const { testerNumber } = params;
  const [episodeData, setEpisodeData] = useState<Episode[] | null>(null);
  const [inputData, setInputData] = useState<Episode>({
    when: "",
    where: "",
    who: "",
    what: "",
  });
  const [episodeCount, setEpisodeCount] = useState(0);

  console.log(episodeData);
  console.log(inputData);

  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "4Wwords", "1", "episodes", "1"));
      console.log(docSnap.data());
    };
    fetchData();
  }, []);

  const onChange = (e: any) => {
    setInputData({ ...inputData, [e.target.id]: e.target.value });
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    console.log(inputData);
    // firebaseにデータを登録
    addDoc(collection(db, "4Wwords", testerNumber, "episodes"), inputData);
    setEpisodeCount(episodeCount + 1);
    setEpisodeData((prev) => (prev ? [...prev, inputData] : [inputData]));
    setInputData({
      when: "",
      where: "",
      who: "",
      what: "",
    });

    // router.push("/input-episodes");
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>話題選択支援研究</h1>
      <h2 className={styles.title}>被験者番号:{params.testerNumber}</h2>

      {/* エピソードを入力 */}
      <form action="post" onSubmit={onSubmit} className={styles.form}>
        <div className={styles.input}>
          <label htmlFor="when" className={styles.label}>
            いつ
          </label>
          <input
            id="when"
            type="text"
            value={inputData.when}
            onChange={onChange}
          />
        </div>

        <div className={styles.input}>
          <label htmlFor="where">どこで</label>
          <input
            id="where"
            type="text"
            value={inputData.where}
            onChange={onChange}
          />
        </div>

        <div className={styles.input}>
          <label htmlFor="who" className={styles.label}>
            誰と
          </label>
          <input
            id="who"
            type="text"
            value={inputData.who}
            onChange={onChange}
          />
        </div>

        <div className={styles.input}>
          <label htmlFor="what" className={styles.label}>
            何を
          </label>
          <input
            id="what"
            type="text"
            value={inputData.what}
            onChange={onChange}
          />
        </div>

        <br />

        <button type="submit">登録</button>
      </form>

      {episodeData &&
        episodeData.map((data, index) => (
          <div key={index}>
            <h2>エピソード{index + 1}</h2>
            <p>{data.when}</p>
            <p>{data.where}</p>
            <p>{data.who}</p>
            <p>{data.what}</p>
          </div>
        ))}
    </main>
  );
}
