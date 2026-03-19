// 🔊 中文语音朗读功能 - 通用脚本
// 在页面加载时自动创建朗读按钮

class VoiceReader {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.isSpeaking = false;
        this.init();
    }

    init() {
        // 检查浏览器支持
        if (!('speechSynthesis' in window)) {
            console.warn('🔊 浏览器不支持语音朗读功能');
            return;
        }
        
        // 加载中文语音
        const loadVoices = () => {
            const voices = this.synth.getVoices();
            // 优先选择中文语音
            this.voice = voices.find(v => v.lang.includes('zh-CN')) || 
                         voices.find(v => v.lang.includes('zh')) ||
                         voices[0];
            console.log('🔊 语音朗读已就绪:', this.voice ? this.voice.name : '默认语音');
        };

        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        // 创建朗读按钮
        this.createButton();
    }

    createButton() {
        const btn = document.createElement('button');
        btn.id = 'voice-reader-btn';
        btn.innerHTML = '🔊 朗读';
        btn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(46, 125, 50, 0.4);
            z-index: 9999;
            transition: all 0.3s;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        `;
        
        btn.onmouseover = () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 6px 20px rgba(46, 125, 50, 0.6)';
        };
        
        btn.onmouseout = () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 4px 15px rgba(46, 125, 50, 0.4)';
        };

        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
        this.btn = btn;
    }

    getText() {
        // 获取页面主要内容
        const sections = document.querySelectorAll('h1, h2, h3, p, li, .business-card p, .news-content p');
        return Array.from(sections)
            .map(el => el.textContent.trim())
            .filter(text => text.length > 0 && text.length < 300)
            .join('。');
    }

    toggle() {
        try {
            if (this.isSpeaking) {
                this.stop();
            } else {
                this.speak();
            }
        } catch (error) {
            console.error('🔊 语音朗读错误:', error);
            alert('语音朗读功能暂时不可用，请检查浏览器设置');
        }
    }

    speak() {
        if (this.synth.speaking) return;

        const text = this.getText();
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9; // 稍慢语速，更清晰
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.btn.innerHTML = '⏸️ 暂停';
            this.btn.style.background = 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)';
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.btn.innerHTML = '🔊 朗读';
            this.btn.style.background = 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)';
        };

        utterance.onerror = (event) => {
            console.error('🔊 语音朗读错误:', event);
            this.isSpeaking = false;
            this.btn.innerHTML = '🔊 朗读';
        };

        this.synth.speak(utterance);
    }

    stop() {
        this.synth.cancel();
        this.isSpeaking = false;
        this.btn.innerHTML = '🔊 朗读';
        this.btn.style.background = 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)';
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VoiceReader());
} else {
    new VoiceReader();
}
