"use client";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Episode {
  when: string;
  where: string;
  who: string;
  what: string;
  do: string;
  thoughts: string;
  sentence?: string; // Optional in case it's not always set
}

const initialInputData: Episode = {
  when: "",
  where: "",
  who: "",
  what: "",
  do: "",
  thoughts: "",
};

export default function Home({ params }: { params: { testerNumber: string } }) {
  const { testerNumber } = params;
  const [episodeData, setEpisodeData] = useState<Episode[] | null>(null);
  const [inputData, setInputData] = useState<Episode>(initialInputData);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewEpisode, setShowNewEpisode] = useState(false); // 新しい状態変数を追加
  const sentence = `${inputData.when}に${inputData.where}で${inputData.who}と${inputData.what}を${inputData.do}。${inputData.thoughts}。`;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const episodeASnapshot = await getDocs(
          collection(db, "4Wwords", testerNumber, "episodeA")
        );
        const episodeBSnapshot = await getDocs(
          collection(db, "4Wwords", testerNumber, "episodeB")
        );
        const episodeCSnapshot = await getDocs(
          collection(db, "4Wwords", testerNumber, "episodeC")
        );

        setEpisodeCount(
          episodeASnapshot.size + episodeBSnapshot.size + episodeCSnapshot.size
        );

        const episodes: Episode[] = [];
        episodeASnapshot.forEach((doc) => episodes.push(doc.data() as Episode));
        episodeBSnapshot.forEach((doc) => episodes.push(doc.data() as Episode));
        episodeCSnapshot.forEach((doc) => episodes.push(doc.data() as Episode));

        setEpisodeData(episodes);
      } catch (error) {
        console.error("エピソードデータの取得に失敗しました: ", error);
      }
    };

    fetchInitialData();
  }, [testerNumber]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let collectionName;
    if (episodeCount < 10) {
      collectionName = "episodeA";
    } else if (episodeCount < 20) {
      collectionName = "episodeB";
    } else {
      collectionName = "episodeC";
    }

    const docID = `${episodeCount + 1}`;
    const docRef = doc(
      collection(db, "4Wwords", testerNumber, collectionName),
      docID
    );

    try {
      await setDoc(docRef, {
        ...inputData,
        sentence: sentence,
        createdAt: serverTimestamp(),
      });

      setEpisodeCount((prev) => prev + 1);
      setEpisodeData((prev) => (prev ? [...prev, inputData] : [inputData]));
      setInputData(initialInputData);
      setShowNewEpisode(true); // 新しいエピソードが追加された後に表示フラグをtrueに
    } catch (error) {
      console.error("エピソードの追加に失敗しました: ", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInputData((prev) => ({ ...prev, [id]: value }));
  };

  const formatWithLeadingZero = (num: number) =>
    num < 10 ? `0${num}` : `${num}`;

  const setTodayDate = () => {
    const today = new Date();
    const formattedDate = `${formatWithLeadingZero(
      today.getMonth() + 1
    )}月${formatWithLeadingZero(today.getDate())}日`;
    setInputData((prev) => ({ ...prev, when: formattedDate }));
    setSelectedDate(null);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = `${formatWithLeadingZero(
        date.getMonth() + 1
      )}月${formatWithLeadingZero(date.getDate())}日`;
      setSelectedDate(date);
      setInputData((prev) => ({ ...prev, when: formattedDate }));
    }
  };

  const renderInputField = (id: keyof Episode, label: string) => (
    <div className={styles.input}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={inputData[id]}
        onChange={handleInputChange}
        required
        className={styles.inputField}
      />
    </div>
  );

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>実験参加者番号:{testerNumber}</h1>
      <h2>現在の登録済エピソード数: {episodeCount}</h2>
      <p>現在の入力：</p>
      <p>
        {inputData.when && (
          <>
            <b>{inputData.when}</b>に
          </>
        )}
        {inputData.where && (
          <>
            <b>{inputData.where}</b>で
          </>
        )}
        {inputData.who && (
          <>
            <b>{inputData.who}</b>と
          </>
        )}
        {inputData.what && (
          <>
            <b>{inputData.what}</b>を
          </>
        )}
        {inputData.do && (
          <>
            <b>{inputData.do}</b>。
          </>
        )}
        {inputData.thoughts && (
          <>
            <b>{inputData.thoughts}</b>。
          </>
        )}
      </p>
      <form action="post" onSubmit={onSubmit} className={styles.form}>
        <div className={styles.input}>
          {renderInputField("when", "いつ")}
          <DatePicker
            className={styles.datePickerIcon}
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MM月dd日"
            customInput={<AiOutlineCalendar size={24} />}
          />
          <button
            type="button"
            onClick={setTodayDate}
            className={styles.todayButton}
          >
            今日
          </button>
        </div>
        {renderInputField("where", "どこで")}
        {renderInputField("who", "誰と")}
        {renderInputField("what", "何を")}
        {renderInputField("do", "どうした")}
        {renderInputField("thoughts", "感想")}
        <button type="submit">登録</button>
      </form>
      {showNewEpisode && episodeData && (
        <div className={styles.registration}>
          <h2>エピソード{episodeCount}</h2>
          <p>いつ：{episodeData[episodeData.length - 1].when}</p>
          <p>どこで：{episodeData[episodeData.length - 1].where}</p>
          <p>誰と：{episodeData[episodeData.length - 1].who}</p>
          <p>何を：{episodeData[episodeData.length - 1].what}</p>
          <p>どうした：{episodeData[episodeData.length - 1].do}</p>
          <p>感想：{episodeData[episodeData.length - 1].thoughts}</p>
        </div>
      )}
    </main>
  );
}
