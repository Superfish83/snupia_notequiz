"use client";

import AnswerBoard from "@/components/answerBoard";
import Score from "@/components/score";
import Timer from "@/components/timer";
import TutorialBoard from "@/components/tutorialBoard";
import useImages from "@/hooks/useImages";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const pitchname = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "Bb",
  "Db",
  "Eb",
  "Gb",
  "Ab",
];
const notename = [
  "라",
  "시",
  "도",
  "레",
  "미",
  "파",
  "솔",
  "라#",
  "도#",
  "레#",
  "파#",
  "솔#",
];
const octavename = ["2", "3", "4", "5", "6"];

export default function Game() {
  const [gameStatus, setGameStatus] = useState(0);
  // 0: 게임 진행 중
  // 1: 오답
  // 2: 타임 오버
  const [correctCnt, setCorrectCnt] = useState(0);
  const [keyHitTime, setKeyHitTime] = useState(null);

  const [quizList, setQuizList] = useState([]);
  const [quizIdx, setQuizIdx] = useState({
    dif: 0, // difficulty
    idx: 0, // index
  });
  const [answer, setAnswer] = useState(-1);
  const [lastAnswer, setLastAnswer] = useState(-1);

  const images = useImages("quizpic");

  const DEBUGMODE = false;

  function initGame() {
    setLastAnswer(-1);
    setCorrectCnt(0);
    setGameStatus(0);
    setQuizList(images?.images);
    setQuizIdx({
      dif: 0,
      idx: Math.floor(Math.random() * images?.images[0]?.length),
    });
  }

  useEffect(() => {
    if (images.loading == false && quizList?.length == 0) initGame();
  }, [images]);

  function updateQuizIdx() {
    let newDif; // new Difficulty
    if (correctCnt < 6) newDif = 0;
    else if (correctCnt < 15) newDif = 1;
    else newDif = 2;

    let newIdx = Math.floor(Math.random() * quizList[quizIdx.dif].length);
    if (newIdx == quizIdx.idx) {
      newIdx = (quizIdx.idx + 1) % quizList[quizIdx.dif].length;
    }

    setQuizIdx({
      dif: newDif,
      idx: newIdx,
    });
  }

  useEffect(() => {
    if (answer == -1) return;

    // Play key sound
    const tmp = getPitch(answer);
    const sound = new Audio(
      `/piano-mp3/${
        (tmp[0] == "A" && tmp.length == 2) || tmp[0] == "B"
          ? getPitch(answer - 12)
          : tmp
      }.mp3`
    );
    sound.play();

    // Check answer
    const correctAnswer = getKeyFromQuizIdx(quizIdx.idx);
    if (answer == correctAnswer) {
      //alert("정답!");
      setCorrectCnt(correctCnt + 1);

      // 다음 문제 출제
      setKeyHitTime(Date.now());
      setTimeout(updateQuizIdx, 70);
    } else {
      //alert("오답!");
      if (!DEBUGMODE) setGameStatus(1);
    }
    setLastAnswer(answer);

    setAnswer(-1);
  }, [answer]);

  function getPitch(key, verbose) {
    if (verbose) {
      return `${key} (${pitchname[key % 12]}${
        octavename[Math.floor(key / 12)]
      },${" "}
        ${notename[key % 12]})`;
    } else {
      return `${pitchname[key % 12]}${octavename[Math.floor(key / 12)]}`;
    }
  }
  function getKeyFromQuizIdx() {
    //console.log(quizList[quizIdx.dif]);
    const t = quizList[quizIdx.dif][quizIdx.idx].slice(1);
    return parseInt(t.slice(t.indexOf("/") + 3, [t.indexOf("_")]));
  }

  const GameRunning = () => (
    <div className="w-full h-full flex flex-col">
      <section className="mx-auto mt-14 font-bold text-xl">
        음표에 맞는 음을 누르세요!
      </section>

      <section className="mx-auto my-4">
        {quizList?.length > 0 ? (
          <div className="flex items-center">
            <div className="w-36" />
            <Score
              imgsrc={quizList[quizIdx.dif][quizIdx.idx]}
              keyHitTime={keyHitTime}
            />
            <div className="w-36 px-4 text-slate-300 text-center">
              난이도: {quizIdx.dif == 0 && "★"}
              {quizIdx.dif == 1 && "★★"}
              {quizIdx.dif == 2 && "★★★"}
            </div>
          </div>
        ) : (
          <div className="w-40 h-40 bg-white flex items-center">
            <div className="mx-auto text-black">Loading...</div>
          </div>
        )}
      </section>

      <section className="mx-auto my-1">
        <AnswerBoard
          setAnswer={setAnswer}
          lastAnswer={lastAnswer}
          keyHitTime={keyHitTime}
        />
        {DEBUGMODE && (
          <div className="text-gray-400">
            [DEBUG] 입력: {getPitch(lastAnswer, true)}
          </div>
        )}
      </section>

      <section className="mx-auto my-4">
        {quizList.length > 0 && (
          <Timer
            seconds={DEBUGMODE ? 3000 : 30}
            barSize={1000}
            setGameStatus={setGameStatus}
          />
        )}
      </section>
    </div>
  );

  const GameOver = () => (
    <div className="w-full h-full flex flex-col">
      <section className="mx-auto mt-12 font-bold text-xl text-center">
        <div className="text-3xl text-red-300 font-bold">
          게임 오버!
          {gameStatus == 1 && ` 오답을 눌렀습니다.`}
          {gameStatus == 2 && ` 제한 시간 종료`}
        </div>
      </section>
      <section className="mx-auto my-4">
        <Score imgsrc={quizList[quizIdx.dif][quizIdx.idx]} />
      </section>
      <section className="mx-auto my-1">
        {gameStatus == 1 && (
          <TutorialBoard right={getKeyFromQuizIdx()} wrong={lastAnswer} />
        )}
        {gameStatus == 2 && <TutorialBoard right={getKeyFromQuizIdx()} />}
      </section>
      <section className="mx-auto mt-4 text-center flex items-center">
        <div className="font-bold text-3xl text-green-200">
          맞힌 개수: {correctCnt}개
        </div>
        <Link className="ml-10 systemBtn" href={"/"}>
          메인 화면으로
        </Link>
      </section>
    </div>
  );

  if (gameStatus == 0) {
    return GameRunning();
  } else return GameOver();
}
