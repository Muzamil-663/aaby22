document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const loadingLine = document.getElementById("loadingLine");
  const progressBar = document.getElementById("progressBar");
  const progressNumber = document.getElementById("progressNumber");
  const loaderHint = document.getElementById("loaderHint");
  const enterButton = document.getElementById("enterButton");
  const music = document.getElementById("birthdayMusic");
  const musicButton = document.getElementById("musicButton");
  const musicIcon = document.getElementById("musicIcon");
  const musicLabel = document.getElementById("musicLabel");
  let readyToEnter = false;

  // A deliberate ~7 second "fake" cinematic loading sequence.
  const loadingSteps = [
    { at: 0, line: "Locating Aaby..." },
    { at: 1300, line: "Scanning outfit photos..." },
    { at: 2850, line: "Collecting blackmail material..." },
    { at: 4550, line: "Preparing emotional damage..." },
    { at: 6100, line: "Birthday surprise ready." }
  ];

  const totalDuration = 7000;
  const startTime = performance.now();
  let activeStep = 0;

  function updateLoader(now) {
    const elapsed = now - startTime;
    const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    progressBar.style.width = `${percent}%`;
    progressNumber.textContent = `${percent}%`;

    while (activeStep + 1 < loadingSteps.length && elapsed >= loadingSteps[activeStep + 1].at) {
      activeStep++;
      loadingLine.textContent = loadingSteps[activeStep].line;
    }

    if (elapsed < totalDuration) {
      requestAnimationFrame(updateLoader);
    } else {
      readyToEnter = true;
      loadingLine.textContent = "System ready.";
      loaderHint.textContent = "Ab birthday boy ko surprise dene ka waqt hai.";
      enterButton.disabled = false;
    }
  }
  requestAnimationFrame(updateLoader);

  function startExperience() {
    if (!readyToEnter) return;

    loader.classList.add("hide");
    document.body.classList.remove("loading");

    // Browsers only permit music after a user interaction.
    music.play()
      .then(() => {
        musicButton.classList.add("playing");
        musicIcon.textContent = "❚❚";
        musicLabel.textContent = "Pause music";
      })
      .catch(() => {
        // Site still works if birthday.mp3 has not been copied yet.
        musicIcon.textContent = "♫";
        musicLabel.textContent = "Play music";
      });
  }

  enterButton.addEventListener("click", startExperience);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") startExperience();
  });

  // Music control
  musicButton.addEventListener("click", () => {
    if (music.paused) {
      music.play()
        .then(() => {
          musicButton.classList.add("playing");
          musicIcon.textContent = "❚❚";
          musicLabel.textContent = "Pause music";
        })
        .catch(() => alert("Copy your audio file as assets/music/birthday.mp3 first."));
    } else {
      music.pause();
      musicButton.classList.remove("playing");
      musicIcon.textContent = "♫";
      musicLabel.textContent = "Play music";
    }
  });

  // Hero button
  document.getElementById("journeyButton").addEventListener("click", () => {
    document.getElementById("outfit").scrollIntoView({ behavior: "smooth" });
  });

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".scroll-reveal").forEach((element) => observer.observe(element));



  // Muted looping videos: they play automatically while their section is visible.
  // Pausing unseen videos keeps the page smooth on phones while preserving the loop effect.
  const loopingVideos = document.querySelectorAll(".auto-loop-video");
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.16, rootMargin: "120px 0px" });

  loopingVideos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    videoObserver.observe(video);
  });

  // Gift opening
  const giftButton = document.getElementById("giftButton");
  const birthdayFinale = document.getElementById("birthdayFinale");
  giftButton.addEventListener("click", () => {
    giftButton.classList.add("opened");
    birthdayFinale.classList.add("show");
    burstConfetti(250);
    setTimeout(() => burstConfetti(160), 650);
    setTimeout(() => burstConfetti(160), 1250);
  });

  // Simple native canvas confetti, no external library required.
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function burstConfetti(amount = 160) {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      particles.push({
        x: x + (Math.random() - .5) * 90,
        y: y + (Math.random() - .5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        gravity: .13 + Math.random() * .06,
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - .5) * 14,
        life: 82 + Math.random() * 65,
        color: ["#efbd4b", "#ffefb8", "#ff8fa7", "#8fd4ff", "#b4efbb"][Math.floor(Math.random() * 5)]
      });
    }
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter((p) => p.life > 0);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= .99;
      p.rotation += p.rotationSpeed;
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.min(1, p.life / 25);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .55);
      ctx.restore();
    });

    requestAnimationFrame(drawConfetti);
  }
  drawConfetti();
});
