

const PAUSE_MS = 350; // pause between title -> summary -> source within one article

function buildScript(article) {
  const summaryText =
    article.summary && article.summary.trim()
      ? article.summary.trim()
      : article.description
        ? article.description.trim()
        : "";

  return {
    id: article.id,
    title: article.title ? article.title.trim() : "",
    summary: summaryText,
    source: article.source ? article.source.trim() : "",
  };
}

export class AudioReader {
  /**
   * @param {Object} options
   * @param {Function} [options.onArticleChange] - (script, index, total) => void
   * @param {Function} [options.onStateChange] - ("playing"|"paused"|"stopped") => void
   * @param {Function} [options.onQueueEnd] - () => void
   * @param {string} [options.voiceName] - preferred voice name, falls back to default
   * @param {number} [options.rate] - speech rate, default 1
   */
  constructor(options = {}) {
    this.onArticleChange = options.onArticleChange || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onQueueEnd = options.onQueueEnd || (() => {});
    this.voiceName = options.voiceName || null;
    this.rate = options.rate || 1;

    this.queue = [];
    this.currentIndex = -1;
    this.currentPartIndex = 0; // 0 = title, 1 = summary, 2 = source
    this.isPlaying = false;
    this.isPaused = false;
    this.voice = null;

    this._loadVoice();
  }

  _loadVoice() {
    const pick = () => {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return;
      if (this.voiceName) {
        this.voice = voices.find((v) => v.name === this.voiceName) || voices[0];
      } else {
        this.voice =
          voices.find((v) => v.lang && v.lang.startsWith("en")) || voices[0];
      }
    };
    pick();
    if (!this.voice) {
      speechSynthesis.addEventListener("voiceschanged", pick, { once: true });
    }
  }

  /**
   * Load a set of articles as rows from the articles table (already ordered
   * however you want them read, e.g. published_at desc) and build the queue.
   */
  setQueue(articles) {
    this.queue = articles.map(buildScript).filter((s) => s.title && s.summary); // skip anything with nothing to say
    this.currentIndex = -1;
    this.currentPartIndex = 0;
  }

  play() {
    if (!this.queue.length) return;

    if (this.isPaused) {
      speechSynthesis.resume();
      this.isPaused = false;
      this.isPlaying = true;
      this.onStateChange("playing");
      return;
    }

    if (this.currentIndex === -1) {
      this.currentIndex = 0;
      this.currentPartIndex = 0;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.onStateChange("playing");
    this._speakCurrentPart();
  }

  pause() {
    if (!this.isPlaying) return;
    speechSynthesis.pause();
    this.isPlaying = false;
    this.isPaused = true;
    this.onStateChange("paused");
  }

  stop() {
    speechSynthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentIndex = -1;
    this.currentPartIndex = 0;
    this.onStateChange("stopped");
  }

  next() {
    speechSynthesis.cancel(); // cuts off mid sentence, matches skip button expectation
    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex += 1;
      this.currentPartIndex = 0;
      if (this.isPlaying) this._speakCurrentPart();
    } else {
      this.stop();
      this.onQueueEnd();
    }
  }

  previous() {
    speechSynthesis.cancel();
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.currentPartIndex = 0;
      if (this.isPlaying) this._speakCurrentPart();
    }
  }

  _speakCurrentPart() {
    const script = this.queue[this.currentIndex];
    if (!script) {
      this.stop();
      this.onQueueEnd();
      return;
    }

    if (this.currentPartIndex === 0) {
      this.onArticleChange(script, this.currentIndex, this.queue.length);
    }

    const parts = [script.title, script.summary, `From ${script.source}.`];
    const text = parts[this.currentPartIndex];

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = this.rate;

    utterance.onend = () => {
      if (!this.isPlaying) return; // paused or stopped mid utterance

      if (this.currentPartIndex < 2) {
        this.currentPartIndex += 1;
        setTimeout(() => {
          if (this.isPlaying) this._speakCurrentPart();
        }, PAUSE_MS);
      } else {
        // finished this article, move to next
        if (this.currentIndex < this.queue.length - 1) {
          this.currentIndex += 1;
          this.currentPartIndex = 0;
          this._speakCurrentPart();
        } else {
          this.isPlaying = false;
          this.currentIndex = -1;
          this.currentPartIndex = 0;
          this.onStateChange("stopped");
          this.onQueueEnd();
        }
      }
    };

    speechSynthesis.speak(utterance);
  }
}
