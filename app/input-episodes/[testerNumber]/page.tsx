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
import { AiOutlineCalendar } from "react-icons/ai"; // カレンダーアイコン用
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Episode {
  when: string;
  where: string;
  who: string;
  what: string;
  do: string;
  thoughts: string;
}

// 入力データの初期値
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
  const sentence = `${inputData.when}に${inputData.where}で${inputData.who}と${inputData.what}を${inputData.do}。${inputData.thoughts}。`;

  useEffect(() => {
    const fetchEpisodeCount = async () => {
      try {
        let episodeCollection = "";
        if (episodeCount < 10) {
          episodeCollection = "episodeA";
        } else if (episodeCount < 20) {
          episodeCollection = "episodeB";
        } else {
          episodeCollection = "episodeC";
        }

        const episodesSnapshot = await getDocs(
          collection(db, "4Wwords", testerNumber, episodeCollection)
        );
        setEpisodeCount(episodesSnapshot.size);
      } catch (error) {
        console.error("エピソードの取得に失敗しました: ", error);
      }
    };
    fetchEpisodeCount();
  }, [testerNumber, episodeCount]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputData({ ...inputData, [e.target.id]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const docID = `${episodeCount + 1}`;

    // episodeCountに基づいて適切なコレクションを選択
    let episodeCollection = "";
    if (episodeCount < 10) {
      episodeCollection = "episodeA";
    } else if (episodeCount < 20) {
      episodeCollection = "episodeB";
    } else {
      episodeCollection = "episodeC";
    }

    // コレクションのパスを確認
    console.log(`Adding episode to collection: ${episodeCollection}`);
    const docRef = doc(
      collection(db, "4Wwords", testerNumber, episodeCollection),
      docID
    );

    await setDoc(docRef, {
      ...inputData,
      sentence: sentence,
      createdAt: serverTimestamp(),
    });
    // コレクションに成功したメッセージ
    console.log(`Episode added: ${docID} to ${episodeCollection}`);
    setEpisodeCount((prev) => prev + 1);
    setEpisodeData((prev) => (prev ? [...prev, inputData] : [inputData]));
    setInputData(initialInputData);
  };

  // 日付をゼロ埋めする関数
  const formatWithLeadingZero = (num: number) =>
    num < 10 ? `0${num}` : `${num}`;

  // 今日の日付を入力する関数
  const setTodayDate = () => {
    const today = new Date();
    const formattedDate = `${formatWithLeadingZero(
      today.getMonth() + 1
    )}月${formatWithLeadingZero(today.getDate())}日`;
    setInputData((prev) => ({ ...prev, when: formattedDate }));
    setSelectedDate(null);
  };

  // 日付を選択した時にフォーマットしてセットする関数
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = `${formatWithLeadingZero(
        date.getMonth() + 1
      )}月${formatWithLeadingZero(date.getDate())}日`;
      setSelectedDate(date);
      setInputData((prev) => ({ ...prev, when: formattedDate }));
    }
  };

  // 入力フィールドを描画する関数
  const renderInputField = (id: keyof Episode, label: string) => (
    <div className={styles.input}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={inputData[id]}
        onChange={onChange}
        required
        className={styles.inputField}
      />
    </div>
  );

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>実験参加者番号:{testerNumber}</h1>
      <h2>現在の登録済エピソード数: {episodeCount}</h2>
      <br />
      <p>例：</p>
      <p>
        「<b>10月11日の夜</b>に<b>大阪</b>に<b>友達</b>と<b>お笑い</b>を
        <b>見に行った</b>。<b>おもしろかった。</b>」
      </p>
      <p>
        「<b>10月19日</b>に<b>ベランダ</b>で<b>一人</b>でいるときに
        <b>スーパームーン</b>を<b>見た</b>。<b>とてもきれいだった</b>。」
      </p>
      <br />
      <p>現在の入力：</p>
      <p>
        {
          <>
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
          </>
        }
      </p>
      <br />
      <form action="post" onSubmit={onSubmit} className={styles.form}>
        <div className={styles.input}>
          {renderInputField("when", "いつ")}
          <div className={styles.datePickerIcon}>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="MM月dd日"
              customInput={<AiOutlineCalendar size={24} />}
            />
          </div>
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
        <br />
        <button type="submit">登録</button>
      </form>

      {/* エピソード表示 */}
      {episodeData &&
        episodeData.map((data, index) => (
          <div key={index} className={styles.registration}>
            <h2>エピソード{episodeCount + 1 - episodeData.length + index}</h2>
            <p>いつ：{data.when}</p>
            <p>どこで：{data.where}</p>
            <p>誰と：{data.who}</p>
            <p>何を：{data.what}</p>
            <p>どうした：{data.do}</p>
            <p>感想：{data.thoughts}</p>
          </div>
        ))}
    </main>
  );
}
