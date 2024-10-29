"use client";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import styles from "./page.module.css";
import { useEffect, useState, useRef } from "react";
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

export default function Home({ params }: { params: { testerNumber: string } }) {
  const { testerNumber } = params;
  const [episodeData, setEpisodeData] = useState<Episode[] | null>(null);
  const [inputData, setInputData] = useState<Episode>({
    when: "",
    where: "",
    who: "",
    what: "",
    do: "",
    thoughts: "",
  });
  const [episodeCount, setEpisodeCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // 日付用のState

  useEffect(() => {
    // エピソード数を取得する関数
    const fetchEpisodeCount = async () => {
      try {
        // Firestoreから該当のtesterNumberのエピソードを取得
        const episodesSnapshot = await getDocs(
          collection(db, "4Wwords", testerNumber, "episodes")
        );
        // ドキュメントの数を取得してセット
        setEpisodeCount(episodesSnapshot.size);
      } catch (error) {
        console.error("エピソードの取得に失敗しました: ", error);
      }
    };
    fetchEpisodeCount();
  }, [testerNumber]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputData({ ...inputData, [e.target.id]: e.target.value });
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    console.log(inputData);

    // firebaseにデータを登録
    await addDoc(collection(db, "4Wwords", testerNumber, "episodes"), {
      ...inputData, // inputDataオブジェクトの各項目を展開
      createdAt: serverTimestamp(),
    });

    setEpisodeCount(episodeCount + 1);
    setEpisodeData((prev) => (prev ? [...prev, inputData] : [inputData]));
    setInputData({
      when: "",
      where: "",
      who: "",
      what: "",
      do: "",
      thoughts: "",
    });
  };

  // 日付をゼロ埋めする関数
  const formatWithLeadingZero = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  // 今日の日付を入力する関数
  const setTodayDate = () => {
    const today = new Date();
    const month = formatWithLeadingZero(today.getMonth() + 1); // getMonth()は0から始まるため+1
    const day = formatWithLeadingZero(today.getDate());
    const formattedDate = `${month}月${day}日`;
    setInputData((prev) => ({ ...prev, when: formattedDate }));
    setSelectedDate(null); // カレンダーの選択をリセット
  };

  // 日付を選択した時にフォーマットしてセットする関数
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const month = formatWithLeadingZero(date.getMonth() + 1);
      const day = formatWithLeadingZero(date.getDate());
      const formattedDate = `${month}月${day}日`;
      setSelectedDate(date); // DatePicker用のState
      setInputData((prev) => ({ ...prev, when: formattedDate })); // フォーマットした日付を入力欄に反映
    }
  };

  return (
    <main className={styles.main}>
      {/* <h1 className={styles.title}>話題選択支援研究</h1> */}
      <h1 className={styles.title}>実験参加者番号:{params.testerNumber}</h1>
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
            required
            className={styles.inputField}
          />

          {/* カレンダーアイコン付きのDatePicker */}
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

        <div className={styles.input}>
          <label htmlFor="where" className={styles.label}>
            どこで
          </label>
          <input
            id="where"
            type="text"
            value={inputData.where}
            onChange={onChange}
            required
            className={styles.inputField}
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
            required
            className={styles.inputField}
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
            required
            className={styles.inputField}
          />
        </div>

        <div className={styles.input}>
          <label htmlFor="do" className={styles.label}>
            どうした
          </label>
          <input
            id="do"
            type="text"
            value={inputData.do}
            onChange={onChange}
            required
            className={styles.inputField}
          />
        </div>

        <div className={styles.input}>
          <label htmlFor="thoughts" className={styles.label}>
            感想
          </label>
          <input
            id="thoughts"
            type="text"
            value={inputData.thoughts}
            onChange={onChange}
            required
            className={styles.inputField}
          />
        </div>

        <br />

        <button type="submit">登録</button>
      </form>

      {/* エピソード表示 */}
      {episodeData &&
        episodeData.map((data, index) => (
          <div key={index} className={styles.registration}>
            <h2>エピソード{episodeCount + 1 - episodeData.length + index}</h2>{" "}
            {/* 初回表示のエピソード番号 */}
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
