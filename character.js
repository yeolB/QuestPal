// 캐릭터 이미지 관리 모듈 (이미지 파일 지원 포함)

class CharacterManager {
    constructor() {
        this.currentState = 'default';
        this.characterElement = null;
        this.emojiFallback = null;
        this.isInitialized = false;
        this.availableImages = {};
        this.imagesLoaded = false;
        
        // 이미지 파일 경로들
        this.imagePaths = {
            default: './assets/characters/default.gif',
            idle: './assets/characters/idle.gif',
            thinking: './assets/characters/thinking.gif',
            happy: './assets/characters/happy.gif',
            celebrating: './assets/characters/celebrating.gif',
            sleepy: './assets/characters/sleepy.gif',
            excited: './assets/characters/excited.gif',
            working: './assets/characters/working.gif'
        };
        
        // 상태별 이모지 매핑 (이미지 없을 때 대체용)
        this.emojiMap = {
            default: '🎯',
            idle: '😌',
            thinking: '🤔',
            happy: '😊',
            celebrating: '🎉',
            sleepy: '😴',
            excited: '⚡',
            working: '💪'
        };
        
        // 상태별 CSS 클래스 매핑
        this.stateClasses = ['thinking', 'celebrating', 'sleepy', 'excited'];
    }
    
    // 이미지 존재 여부 확인
    async checkImageExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
    
    // 사용 가능한 이미지들 로드
    async loadImages() {
        console.log('캐릭터 이미지 확인 중...');
        
        const loadPromises = Object.entries(this.imagePaths).map(async ([state, path]) => {
            const exists = await this.checkImageExists(path);
            if (exists) {
                this.availableImages[state] = path;
                console.log(`✅ ${state}: ${path}`);
            } else {
                console.log(`❌ ${state}: ${path} (이모지 대체)`);
            }
        });
        
        await Promise.all(loadPromises);
        this.imagesLoaded = true;
        console.log('이미지 로딩 완료:', Object.keys(this.availableImages));
    }
    
    // 초기화
    async initialize() {
        this.characterElement = document.getElementById('character');
        this.emojiFallback = this.characterElement?.querySelector('.emoji-fallback');
        
        if (!this.characterElement || !this.emojiFallback) {
            console.error('캐릭터 요소를 찾을 수 없습니다.');
            return false;
        }
        
        // 이미지가 전체적으로 보이도록 CSS 설정
        this.setupImageStyles();
        
        // 이미지들 로드
        await this.loadImages();
        
        // 시간대별 초기 상태 설정
        this.updateByTime();
        
        this.isInitialized = true;
        console.log('캐릭터 매니저 초기화 완료');
        return true;
    }
    
    // 이미지 표시 스타일 설정 (이미지 전체가 보이도록)
    setupImageStyles() {
        const styles = {
            backgroundSize: 'contain',        // 이미지 전체가 보이도록
            backgroundRepeat: 'no-repeat',    // 반복하지 않음
            backgroundPosition: 'center'      // 중앙 정렬
        };
        
        Object.assign(this.characterElement.style, styles);
    }
    
    // 이미지 설정
    setImage(imagePath) {
        if (!this.characterElement || !this.emojiFallback) return;
        
        if (imagePath) {
            // 이미지 사용
            this.characterElement.style.backgroundImage = `url('${imagePath}')`;
            this.characterElement.classList.add('has-image');
            this.emojiFallback.style.display = 'none';
            console.log('이미지 설정:', imagePath);
        } else {
            // 이모지 사용
            this.characterElement.style.backgroundImage = 'none';
            this.characterElement.classList.remove('has-image');
            this.emojiFallback.style.display = 'block';
            console.log('이모지 모드로 변경');
        }
    }
    
    // 캐릭터 상태 변경
    setState(state) {
        if (!this.isInitialized) {
            console.warn('캐릭터 매니저가 초기화되지 않았습니다.');
            return;
        }
        
        this.currentState = state;
        
        // 이미지가 로드되지 않았으면 잠시 대기
        if (!this.imagesLoaded) {
            setTimeout(() => this.setState(state), 100);
            return;
        }
        
        // 사용 가능한 이미지가 있으면 이미지 사용, 없으면 이모지
        const imagePath = this.availableImages[state] || null;
        this.setImage(imagePath);
        
        // 이모지 업데이트 (이미지가 없을 때를 위해)
        this.updateEmoji();
        
        // 상태별 효과 적용
        this.applyStateEffects(state);
        
        console.log(`캐릭터 상태 변경: ${state}`);
    }
    
    // 이모지 업데이트
    updateEmoji() {
        const emoji = this.emojiMap[this.currentState] || this.emojiMap.default;
        this.emojiFallback.textContent = emoji;
    }
    
    // 상태별 시각적 효과 적용
    applyStateEffects(state) {
        // 기존 상태 클래스 제거
        this.characterElement.classList.remove(...this.stateClasses);
        
        // 새 상태 클래스 추가 (해당하는 경우)
        if (this.stateClasses.includes(state)) {
            this.characterElement.classList.add(state);
        }
    }
    
    // 시간대별 상태 업데이트
    updateByTime() {
        const hour = new Date().getHours();
        
        let state;
        if (hour >= 22 || hour < 6) {
            state = 'sleepy';
        } else if (hour >= 6 && hour < 9) {
            state = 'excited';
        } else if (hour >= 9 && hour < 18) {
            state = 'working';
        } else {
            state = 'idle';
        }
        
        this.setState(state);
    }
    
    // 미션 타입별 상태 업데이트
    updateForMission(missionType) {
        const missionStateMap = {
            'health': 'excited',
            'productivity': 'working',
            'social': 'happy',
            'mindfulness': 'thinking',
            'creativity': 'excited'
        };
        
        const state = missionStateMap[missionType] || 'default';
        this.setState(state);
    }
    
    // 상태 강제 새로고침
    refresh() {
        if (this.isInitialized) {
            this.setState(this.currentState);
        }
    }
    
    // 현재 상태 반환
    getCurrentState() {
        return this.currentState;
    }
    
    // 사용 가능한 이미지 목록 반환
    getAvailableImages() {
        return { ...this.availableImages };
    }
    
    // 디버그 정보
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            imagesLoaded: this.imagesLoaded,
            currentState: this.currentState,
            availableImages: Object.keys(this.availableImages),
            hasCharacterElement: !!this.characterElement,
            hasEmojiFallback: !!this.emojiFallback
        };
    }
}

// 전역 캐릭터 매니저 인스턴스
const characterManager = new CharacterManager();

// 기존 함수들을 매니저 메서드에 연결 (하위 호환성 유지)
function setCharacterState(state) {
    characterManager.setState(state);
}

function updateCharacterByTime() {
    characterManager.updateByTime();
}

function updateCharacterForMission(missionType) {
    characterManager.updateForMission(missionType);
}

async function initializeCharacterSystem() {
    return await characterManager.initialize();
}

// 캐릭터 상태 상수들
const CHARACTER_STATES = {
    DEFAULT: 'default',
    IDLE: 'idle',
    THINKING: 'thinking',
    HAPPY: 'happy',
    CELEBRATING: 'celebrating',
    SLEEPY: 'sleepy',
    EXCITED: 'excited',
    WORKING: 'working'
};

// 유틸리티 함수들
const CharacterUtils = {
    // 랜덤 상태 반환
    getRandomState() {
        const states = Object.values(CHARACTER_STATES);
        return states[Math.floor(Math.random() * states.length)];
    },
    
    // 상태 유효성 검사
    isValidState(state) {
        return Object.values(CHARACTER_STATES).includes(state);
    },
    
    // 모든 상태 순환 테스트 (디버그용)
    async testAllStates(interval = 2000) {
        const states = Object.values(CHARACTER_STATES);
        for (let i = 0; i < states.length; i++) {
            console.log(`테스트 상태: ${states[i]}`);
            characterManager.setState(states[i]);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    },
    
    // 디버그 정보 출력
    debugCharacter() {
        console.log('=== 캐릭터 디버그 정보 ===');
        console.log(characterManager.getDebugInfo());
        console.log('사용 가능한 상태:', Object.values(CHARACTER_STATES));
        console.log('========================');
    }
};

// 개발 도구 (브라우저 콘솔에서 접근 가능)
if (typeof window !== 'undefined') {
    window.CharacterManager = characterManager;
    window.CHARACTER_STATES = CHARACTER_STATES;
    window.CharacterUtils = CharacterUtils;
}