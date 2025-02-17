export default function AnswerBoard({ answer, setAnswer }) {
  const boardW = 1200;
  const boardH = 220;
  const boardStyle = {
    width: `${boardW}px`,
    height: `${boardH}px`,
  };

  const wkCount = 7 * 5;

  const wkW = boardW / wkCount;
  const wkH = boardH;

  const bkW = 0.58 * wkW;
  const bkH = 0.65 * wkH;

  function KeyButton({ id, x, isblack, selected }) {
    const keyStyle = isblack
      ? {
          width: `${bkW}px`,
          height: `${bkH}px`,
          left: `${x}px`,
        }
      : {
          width: `${wkW}px`,
          height: `${wkH}px`,
          left: `${x}px`,
        };
    return (
      <button
        className={`absolute border-slate-500 border ${
          isblack ? "bg-black hover:bg-gray-800" : "bg-white hover:bg-gray-200"
        }`}
        style={keyStyle}
        onClick={() => {
          setAnswer(id);
        }}
      />
    );
  }

  function OctaveBoard({ octave }) {
    let wk = [0, 1, 2, 3, 4, 5, 6];
    let bk = [7, 8, 9, 10, 11];
    //const bkpos = [105, 301, 595, 793, 987];
    const bkpos = [137, 441, 637, 941, 1129];

    for (let i = 0; i < 7; i++) {
      wk[i] += 12 * octave;
    }
    for (let i = 0; i < 5; i++) {
      bk[i] += 12 * octave;
    }

    return (
      <>
        {wk.map((key) => (
          <KeyButton
            key={key}
            id={key}
            x={((key % 12) + 7 * octave) * wkW}
            isblack={false}
            selected={key == answer}
          />
        ))}
        {bk.map((key) =>
          key == 11 + 12 * 4 ? null : (
            <KeyButton
              key={key}
              id={key}
              x={
                ((bkpos[(key % 12) - 7] + 1176 * octave) / (1176 * 5)) * boardW
              }
              isblack={true}
              selected={key == answer}
            />
          )
        )}
      </>
    );
  }

  return (
    <div className="bg-slate-500 p-4">
      <div className={`relative cursor-pointer`} style={boardStyle}>
        <OctaveBoard octave={4} />
        <OctaveBoard octave={3} />
        <OctaveBoard octave={2} />
        <OctaveBoard octave={1} />
        <OctaveBoard octave={0} />
      </div>
    </div>
  );
}
