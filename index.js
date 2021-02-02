(async () => {
  const lab = await fetch("/lvl.json").then((a) => a.json());
  const allLvls = lab.length;
  let currentLvl = 1;
  const canvas = document.querySelector("#labirynt");
  const ctx = canvas.getContext("2d");
  const basic = 50;
  const space = 50;
  let cw = basic * 10;
  let ch = basic * 10 ;
  canvas.width = cw;
  canvas.height = ch;
  const pointStart = { x: null, y: null };
  const pointEnd = { x: null, y: null };

  const resizeCanvas = () => {
    const width = canvas.parentElement.offsetWidth;
    canvas.style.transform = `scale(${
      width < 500 ? canvas.parentElement.offsetWidth / 500 : 1
    })`;
  };
  resizeCanvas();
  const setCanvas = () => {
    const { x, y, now, wall, position, chest } = lab[currentLvl - 1];
    const left = (cw - x * basic) / 2;
    let nowCur = now,
      chestCur = chest;
    const XandY = (pos) => {
      return {
        xc: (pos % x) * basic + left,
        yc: ((pos - (pos % x)) / x) * basic,
      };
    };
    const drawRect = (pos, type) => {
      const { xc, yc } = XandY(pos);
      const bgC =
        type === "position" ? "white" : type === "wall" ? "#111" : "#777";
      ctx.fillStyle = bgC;
      ctx.fillRect(xc, yc + space, basic, basic);
      ctx.strokeStyle = "black";
      ctx.strokeRect(xc, yc + space, basic, basic);
    };
    const drawBall = (pos) => {
      const { xc, yc } = XandY(pos);
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = "#add8e6";
      ctx.lineWidth = 3;
      ctx.arc(xc + basic / 2, yc + basic / 2 + space, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    const drawChest = (pos) => {
      const { xc, yc } = XandY(pos);
      const pad = 8;
      ctx.save();
      ctx.fillStyle = "#c60";
      ctx.fillRect(
        xc + pad,
        yc + pad + space,
        basic - pad * 2,
        basic - pad * 2
      );
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        xc + pad,
        yc + pad + space,
        basic - pad * 2,
        basic - pad * 2
      );
      ctx.restore();
    };
    const drawPalete = () => {
      ctx.fillStyle = "#777";
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = "white";
      ctx.font = `20px Arlia`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Poziom ${currentLvl}/${allLvls}`, cw / 2, 20);
      for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
          const cur = j + i * x;
          if (wall.includes(cur)) {
            drawRect(cur, "wall");
          } else if (position.includes(cur)) {
            drawRect(cur, "position");
          } else {
            drawRect(cur);
          }
          if (nowCur === cur) {
            drawBall(cur);
          } else if (chestCur.includes(cur)) {
            drawChest(cur);
          }
        }
      }
      if (position.sort().join() === chest.sort().join()) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        if (allLvls === currentLvl) {
          ctx.font = "15px Arial";
          ctx.fillText(
            "Brawo, udało ci się przejść wszystkie poziomy !",
            canvas.width / 2,
            canvas.height / 2
          );
        } else {
          ctx.fillText(">Dalej<", canvas.width / 2, canvas.height / 2);
          canvas.style.cursor = "pointer";
          currentLvl++;
          canvas.onclick = () => {
            setCanvas(currentLvl);
            canvas.style.cursor = "context-menu";
            canvas.onclick = () => {};
          };
          canvas.ontouchstart = () => {
            setCanvas(currentLvl);
            canvas.ontouchstart = () => {};
          };
        }
      }
    };
    drawPalete();
    const move = (a) => {
      const b = nowCur + a;
      if (
        !(
          wall.includes(b) ||
          (chest.includes(b) && (wall.includes(b + a) || chest.includes(b + a)))
        )
      ) {
        if (chest.includes(b)) {
          const index = chest.indexOf(b);
          chest[index] += a;
        }
        nowCur = b;
        drawPalete();
      }
    };
    window.onkeydown = function (e) {
      e.preventDefault();
      switch (e.keyCode) {
        case 37:
          move(-1);
          break;
        case 38:
          move(-x);
          break;
        case 39:
          move(1);
          break;
        case 40:
          move(x);
          break;
        default:
          break;
      }
    };
    canvas.ontouchstart = function (e) {
      const a = e.targetTouches["0"];
      pointStart.y = a.clientY;
      pointStart.x = a.clientX;
      e.preventDefault();
    };
    canvas.ontouchmove = function (e) {
      const a = e.targetTouches["0"];
      pointEnd.x = a.clientX;
      pointEnd.y = a.clientY;
      e.preventDefault();
    };
    canvas.ontouchend = function (e) {
      const xp = pointStart.x - pointEnd.x;
      const yp = pointStart.y - pointEnd.y;
      if (Math.abs(xp) > 50 || Math.abs(yp) > 50) {
        if (Math.abs(xp) > Math.abs(yp)) {
          xp < 0 ? move(1) : move(-1);
        } else {
          yp < 0 ? move(x) : move(-x);
        }
      }
    };
  };
  setCanvas();
  window.addEventListener("resize", resizeCanvas);
})();
