// ==========================================================================
// Mission Buddy - 메인 스크립트
// ==========================================================================
// 역할: 미션 생성, 관리, UI 상호작용 등 애플리케이션의 모든 동작을 제어합니다.
// ==========================================================================


// ==========================================================================
// # 상수 및 설정값
// - 코드의 가독성을 높이고 유지보수를 용이하게 하기 위해 주요 설정값들을 중앙에서 관리합니다.
// ==========================================================================

const CONSTANTS = {
    // 시간 관련 설정 (단위: 밀리초 ms)
    ACTIVE_MISSION_AUTO_PENDING_TIME: 10000, // 활성 미션이 자동으로 '완료 대기'로 넘어가는 시간 (10초)
    TRANSITION_ANIMATION_DURATION: 800,       // 말풍선 이동 애니메이션 시간 (0.8초)
    INITIAL_MISSION_DELAY: 2000,              // 앱 시작 후 첫 미션이 표시되기까지의 대기 시간 (2초)
    NEXT_MISSION_MIN_DELAY: 30 * 1000,        // 다음 미션 표시까지의 최소 대기 시간 (30초)
    NEXT_MISSION_MAX_DELAY: 5 * 60 * 1000,    // 다음 미션 표시까지의 최대 대기 시간 (5분)
    PENDING_ITEM_REMOVE_DELAY: 300,           // 완료 대기 항목이 사라지는 애니메이션 시간 (0.3초)
    CELEBRATION_DURATION: 2000,               // 미션 완료 축하 애니메이션 시간 (2초)

    // 미션 관련 설정
    MAX_PENDING_MISSIONS: 5,                  // '완료 대기' 목록에 보관할 수 있는 최대 미션 개수

    // CSS 클래스 및 상태 이름
    MODE_IDLE: 'idle-mode',
    MODE_ACTIVE: 'active-mode',
    MODE_TRANSITION: 'transition-mode',
    CLASS_SHOW: 'show',
    CLASS_PERSISTENT: 'persistent',
    CLASS_MOVING_TO_PENDING: 'moving-to-pending',

    // 통계 저장용 키
    STATS_COMPLETED: 'completed',
    STATS_AUTO_COMPLETED: 'auto_completed',
};

// HTML 요소에 접근하기 위한 셀렉터(선택자) 모음
const UI_SELECTORS = {
    container: '.container',
    characterContainer: '#characterContainer',
    character: '#character',
    speechBubble: '#speechBubble',
    missionText: '#missionText',
    timerDisplay: '#timerDisplay',
    timerText: '#timerText',
    buttons: '.buttons',
};


// ==========================================================================
// # MissionManager 클래스
// - 미션과 관련된 모든 데이터와 기능을 관리하는 핵심 객체입니다.
// ==========================================================================

class MissionManager {
    /**
     * MissionManager의 생성자입니다. 상태 변수와 UI 요소들을 초기화합니다.
     */
    constructor() {
        // 미션 데이터 및 상태
        this.activeMission = null;      // 현재 활성화된 미션 객체
        this.pendingMissions = [];      // '완료 대기' 미션 목록 배열
        this.isMissionActive = false;   // 미션이 현재 활성화 상태인지 여부
        this.currentMode = CONSTANTS.MODE_IDLE; // 캐릭터의 현재 상태 모드

        // 타이머 ID
        this.activeMissionTimer = null; // 활성 미션의 자동 이동 타이머
        this.nextMissionTimer = null;   // 다음 미션 생성 스케줄 타이머

        // UI 요소들을 담을 객체 (초기화 시 채워짐)
        this.ui = {};
    }

    /**
     * 애플리케이션 시작 시 호출되는 초기화 함수입니다.
     * DOM 요소를 찾고, 이벤트를 설정하며, 시스템을 준비시킵니다.
     * @returns {Promise<boolean>} 초기화 성공 여부를 반환합니다.
     */
    async initialize() {
        // UI_SELECTORS를 기반으로 모든 DOM 요소를 찾아 this.ui 객체에 저장합니다.
        for (const key in UI_SELECTORS) {
            this.ui[key] = document.querySelector(UI_SELECTORS[key]);
        }
        
        // 필수 UI 요소가 하나라도 없는 경우, 에러를 출력하고 초기화를 중단합니다.
        if (!this.ui.characterContainer || !this.ui.character || !this.ui.speechBubble) {
            console.error('필수 DOM 요소를 찾을 수 없습니다. HTML 구조를 확인해주세요.');
            return false;
        }

        this.createPendingContainer(); // '완료 대기' 목록을 담을 컨테이너를 동적으로 생성합니다.
        this.setupPersistentCharacter(); // 캐릭터가 항상 화면에 표시되도록 설정합니다.
        this.setupEventListeners(); // 클릭, 키보드 등 사용자 입력에 대한 이벤트를 설정합니다.

        console.log('미션 매니저 초기화 완료 - 캐릭터 상시 표시 모드');
        return true;
    }

    /**
     * 캐릭터가 항상 화면에 표시되도록 초기 상태를 설정합니다.
     */
    setupPersistentCharacter() {
        this.ui.characterContainer.classList.add(CONSTANTS.CLASS_PERSISTENT);
        this.setCharacterMode(CONSTANTS.MODE_IDLE); // 초기 모드는 '대기' 상태입니다.
        console.log('캐릭터 상시 표시 모드 활성화');
    }

    /**
     * 캐릭터의 표시 모드(대기, 활성, 전환)를 변경합니다.
     * 이 함수는 CSS 클래스를 제어하여 시각적 상태를 바꿉니다.
     * @param {string} mode - 변경할 모드 이름 (CONSTANTS.MODE_IDLE 등)
     */
    setCharacterMode(mode) {
        this.currentMode = mode;
        const container = this.ui.characterContainer;
        
        // 모든 모드 관련 클래스를 먼저 제거하여 상태가 중첩되지 않도록 합니다.
        container.classList.remove(CONSTANTS.MODE_IDLE, CONSTANTS.MODE_ACTIVE, CONSTANTS.MODE_TRANSITION);
        
        // 요청된 모드에 맞는 클래스를 추가하고 관련 UI를 제어합니다.
        switch (mode) {
            case CONSTANTS.MODE_IDLE:
                container.classList.add(CONSTANTS.MODE_IDLE);
                this.ui.speechBubble.classList.remove(CONSTANTS.CLASS_SHOW);
                this.ui.buttons.style.display = 'none';
                this.ui.timerDisplay.style.display = 'none';
                console.log('캐릭터 모드: 대기');
                break;
                
            case CONSTANTS.MODE_ACTIVE:
                container.classList.add(CONSTANTS.MODE_ACTIVE);
                this.ui.speechBubble.classList.add(CONSTANTS.CLASS_SHOW);
                // 활성 상태에서는 기본 버튼과 타이머를 숨깁니다.
                this.ui.buttons.style.display = 'none';
                this.ui.timerDisplay.style.display = 'none';

                console.log('캐릭터 모드: 미션 활성');
                break;
                
            case CONSTANTS.MODE_TRANSITION:
                container.classList.add(CONSTANTS.MODE_TRANSITION);
                console.log('캐릭터 모드: 전환 중');
                break;
        }
    }

    /**
     * '완료 대기' 미션 목록을 표시할 DOM 컨테이너를 생성하여 페이지에 추가합니다.
     */
    createPendingContainer() {
        const pendingContainer = document.createElement('div');
        pendingContainer.className = 'pending-missions-container';
        pendingContainer.id = 'pendingMissions';
        this.ui.container.appendChild(pendingContainer);
        
        // 생성된 컨테이너를 this.ui 객체에도 저장하여 일관성 있게 관리합니다.
        this.ui.pendingContainer = pendingContainer;
    }

    /**
     * 애플리케이션의 주요 이벤트 리스너들을 설정합니다.
     */
    setupEventListeners() {
        // 캐릭터 클릭 시: 미션이 없으면 보여주고, 있으면 '완료 대기'로 보냅니다.
        this.ui.character?.addEventListener('click', () => {
            if (!this.isMissionActive) {
                this.showMission();
            } else {
                this.moveToPending();
            }
        });
        
        // 키보드 입력 처리
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMissionActive) {
                this.moveToPending(); // ESC: 활성 미션을 '완료 대기'로
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault(); // 스페이스바의 기본 동작(스크롤 등)을 막습니다.
                if (!this.isMissionActive) {
                    this.showMission(); // 스페이스바: 새 미션 표시
                }
            }
        });

        // 이벤트 위임(Event Delegation) 사용:
        // '완료 대기' 목록 전체에 하나의 이벤트 리스너를 설정하여,
        // 동적으로 추가되는 각 미션의 '완료' 버튼 클릭을 효율적으로 처리합니다.
        this.ui.pendingContainer.addEventListener('click', (event) => {
            const completeButton = event.target.closest('.pending-complete-btn');
            if (completeButton) {
                const missionItem = event.target.closest('.pending-mission-item');
                if (missionItem) {
                    const missionId = missionItem.dataset.missionId;
                    this.completePendingMission(missionId);
                }
            }
        });
    }

    /**
     * 새로운 미션을 사용자에게 보여줍니다.
     */
    showMission() {
        if (this.isMissionActive) return; // 이미 미션이 활성화된 경우 중복 실행 방지
        
        this.activeMission = this.createMissionObject(getRandomMission()); // 랜덤 미션 생성
        this.ui.missionText.textContent = this.activeMission.text;
        
        const category = this.getMissionCategory(this.activeMission.text);
        setCharacterState('thinking'); // 캐릭터 상태 변경 (외부 함수 호출)
        
        this.setCharacterMode(CONSTANTS.MODE_ACTIVE); // 캐릭터를 '활성' 모드로 변경
        this.isMissionActive = true;
        
        setTimeout(() => {
            updateCharacterForMission(category); // 1초 후 미션 유형에 맞는 캐릭터로 변경
        }, 1000);
        
        // 타이머 설정: 10초간 아무런 조작이 없으면 자동으로 '완료 대기'로 이동
        this.activeMissionTimer = setTimeout(() => {
            this.moveToPending();
        }, CONSTANTS.ACTIVE_MISSION_AUTO_PENDING_TIME);
        
        console.log('활성 미션 표시:', this.activeMission.text);
    }

    /**
     * 미션 데이터를 기반으로 표준 미션 객체를 생성합니다.
     * @param {object} missionData - {text, duration} 형태의 원본 미션 데이터
     * @returns {object} - id, 남은 시간 등이 추가된 미션 객체
     */
    createMissionObject(missionData) {
        return {
            id: Date.now() + Math.random(), // 고유 ID 생성
            text: missionData.text,
            duration: missionData.duration,
            createdAt: new Date(),
            remainingTime: missionData.duration * 60 // 남은 시간을 초 단위로 변환
        };
    }
    
    /**
     * 현재 활성화된 미션을 '완료 대기' 목록으로 이동시킵니다.
     */
    moveToPending() {
        if (!this.isMissionActive || !this.activeMission) return;
        
        // 목록이 꽉 찼으면 가장 오래된 미션을 제거합니다.
        if (this.pendingMissions.length >= CONSTANTS.MAX_PENDING_MISSIONS) {
            const oldestMission = this.pendingMissions.shift(); // 배열의 맨 앞 요소를 제거하고 반환
            this.removePendingMissionUI(oldestMission.id);
            console.log('가장 오래된 완료 대기 미션 제거:', oldestMission.text);
        }
        
        this.pendingMissions.push(this.activeMission); // 현재 미션을 목록에 추가
        this.createPendingMissionUI(this.activeMission); // 화면에 UI 생성
        this.animateTransition(); // 말풍선이 날아가는 애니메이션 시작
        
        console.log('완료 대기로 이동:', this.activeMission.text);
    }
    
    /**
     * 말풍선이 '완료 대기' 목록으로 이동하는 애니메이션을 처리합니다.
     */
    animateTransition() {
        this.setCharacterMode(CONSTANTS.MODE_TRANSITION); // '전환' 모드로 변경
        this.ui.speechBubble.classList.add(CONSTANTS.CLASS_MOVING_TO_PENDING);
        
        // 애니메이션이 끝나는 시점에 맞춰 뒷정리 작업을 수행합니다.
        setTimeout(() => {
            this.endActiveMission(); // 활성 미션 상태를 완전히 종료
            this.setCharacterMode(CONSTANTS.MODE_IDLE); // 캐릭터를 '대기' 모드로 복귀
            this.ui.speechBubble.classList.remove(CONSTANTS.CLASS_MOVING_TO_PENDING); // 애니메이션 클래스 제거
            this.scheduleNextMission(); // 다음 미션이 나타나도록 예약
        }, CONSTANTS.TRANSITION_ANIMATION_DURATION);
    }
    
    /**
     * 활성화된 미션 상태를 종료하고 관련 데이터를 정리합니다.
     */
    endActiveMission() {
        if (this.activeMissionTimer) {
            clearTimeout(this.activeMissionTimer); // 자동 이동 타이머 취소
            this.activeMissionTimer = null;
        }
        
        this.isMissionActive = false;
        this.activeMission = null; // 활성 미션 정보 초기화
        
        updateCharacterByTime(); // 시간에 맞는 기본 캐릭터 상태로 복귀
    }

    /**
     * '완료 대기' 미션 항목의 UI를 생성합니다.
     * @param {object} mission - UI로 만들 미션 객체
     */
    createPendingMissionUI(mission) {
        const pendingItem = document.createElement('div');
        pendingItem.className = 'pending-mission-item';
        pendingItem.dataset.missionId = mission.id;
        
        // 버튼에서 onclick 속성을 제거했습니다. 이벤트는 setupEventListeners에서 위임 처리됩니다.
        pendingItem.innerHTML = `
            <div class="pending-mission-content">
                <p class="pending-mission-text">${mission.text}</p>
                <div class="pending-mission-timer">
                    <span class="pending-timer-text">${this.formatTime(mission.remainingTime)}</span>
                </div>
            </div>
            <button class="pending-complete-btn">
                완료
            </button>
        `;
        
        // 부드럽게 나타나는 애니메이션 효과
        pendingItem.style.opacity = '0';
        pendingItem.style.transform = 'translateX(50px)';
        this.ui.pendingContainer.appendChild(pendingItem);
        
        this.startPendingTimer(mission.id); // 미션 타이머 시작
        
        // 짧은 지연 후 애니메이션 시작 (브라우저 렌더링을 위함)
        setTimeout(() => {
            pendingItem.style.opacity = '1';
            pendingItem.style.transform = 'translateX(0)';
        }, 100);
    }
    
    /**
     * '완료 대기' 미션의 남은 시간 타이머를 시작합니다.
     * @param {string|number} missionId - 타이머를 시작할 미션의 ID
     */
    startPendingTimer(missionId) {
        const mission = this.pendingMissions.find(m => m.id === missionId);
        if (!mission) return;
        
        const interval = setInterval(() => {
            mission.remainingTime--; // 1초마다 시간 감소
            
            const timerElement = this.ui.pendingContainer.querySelector(`[data-mission-id="${missionId}"] .pending-timer-text`);
            if (timerElement) {
                timerElement.textContent = this.formatTime(mission.remainingTime);
            }
            
            if (mission.remainingTime <= 0) {
                clearInterval(interval);
                this.autoCompletePendingMission(missionId); // 시간이 다 되면 자동 실패 처리
            }
        }, 1000);
        
        mission.timerId = interval; // 나중에 타이머를 중지할 수 있도록 ID 저장
    }
    
    /**
     * 초 단위 시간을 '분:초' 형식의 문자열로 변환합니다.
     * @param {number} seconds - 변환할 시간(초)
     * @returns {string} - "m:ss" 형식의 문자열
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`; // 초가 한 자리 수일 때 앞에 0을 붙여줍니다.
    }
    
    /**
     * '완료' 버튼을 눌러 '완료 대기' 미션을 완료 처리합니다.
     * @param {string|number} missionId - 완료할 미션의 ID
     */
    completePendingMission(missionId) {
        const missionIndex = this.pendingMissions.findIndex(m => m.id == missionId);
        if (missionIndex === -1) return;
        
        const mission = this.pendingMissions[missionIndex];
        
        if (mission.timerId) {
            clearInterval(mission.timerId); // 타이머 중지
        }
        
        this.updateMissionStats(CONSTANTS.STATS_COMPLETED); // 통계 업데이트
        this.pendingMissions.splice(missionIndex, 1); // 배열에서 미션 제거
        this.removePendingMissionUI(missionId); // 화면에서 UI 제거
        this.showCompletionFeedback('완료! 🎉', mission.text); // 완료 피드백 표시
        
        console.log('완료 대기 미션 완료:', mission.text);
    }
    
    /**
     * 시간이 다 되어 '완료 대기' 미션을 자동으로 제거(실패) 처리합니다.
     * @param {string|number} missionId - 자동 완료할 미션의 ID
     */
    autoCompletePendingMission(missionId) {
        const missionIndex = this.pendingMissions.findIndex(m => m.id == missionId);
        if (missionIndex === -1) return;

        const mission = this.pendingMissions[missionIndex];
        
        this.updateMissionStats(CONSTANTS.STATS_AUTO_COMPLETED); // 통계 업데이트
        this.pendingMissions.splice(missionIndex, 1);
        this.removePendingMissionUI(missionId);
        
        console.log('완료 대기 미션 시간 종료:', mission.text);
    }
    
    /**
     * '완료 대기' 미션 항목의 UI를 부드럽게 사라지는 애니메이션과 함께 제거합니다.
     * @param {string|number} missionId - 제거할 UI의 미션 ID
     */
    removePendingMissionUI(missionId) {
        const element = this.ui.pendingContainer.querySelector(`[data-mission-id="${missionId}"]`);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(50px)';
            setTimeout(() => element.remove(), CONSTANTS.PENDING_ITEM_REMOVE_DELAY);
        }
    }

    /**
     * 다음 미션이 나타날 시간을 랜덤하게 스케줄링합니다.
     */
    scheduleNextMission() {
        const delay = Math.random() * (CONSTANTS.NEXT_MISSION_MAX_DELAY - CONSTANTS.NEXT_MISSION_MIN_DELAY) + CONSTANTS.NEXT_MISSION_MIN_DELAY;
        console.log(`다음 미션까지 ${Math.round(delay/1000)}초`);
        
        this.nextMissionTimer = setTimeout(() => {
            this.showMission();
        }, delay);
    }

    // ... (getMissionCategory, updateMissionStats, showCompletionFeedback, completeActiveMission, cleanup, getDebugInfo 등 나머지 함수들은 변경점이 적어 생략합니다. 필요 시 기존 코드를 그대로 사용하시면 됩니다.)
    // (아래에 기존 코드를 붙여넣었습니다)

    getMissionCategory(missionText) {
        for (const [category, missionList] of Object.entries(missions)) {
            if (missionList.some(mission => mission.text === missionText)) {
                return category;
            }
        }
        return 'default';
    }
    
    updateMissionStats(action) {
        try {
            const stats = JSON.parse(localStorage.getItem('missionStats')) || { completed: 0, skipped: 0, auto_completed: 0, total: 0 };
            stats[action]++;
            stats.total++;
            localStorage.setItem('missionStats', JSON.stringify(stats));
        } catch (error) {
            console.error('통계 저장 오류:', error);
        }
    }

    showCompletionFeedback(message, missionText) {
        setCharacterState('celebrating');
        setTimeout(() => {
            updateCharacterByTime();
        }, CONSTANTS.CELEBRATION_DURATION);
        console.log(`${message} - ${missionText}`);
    }

    completeActiveMission() {
        if (!this.isMissionActive || !this.activeMission) return;
        this.updateMissionStats(CONSTANTS.STATS_COMPLETED);
        this.showCompletionFeedback('즉시 완료! 🎉', this.activeMission.text);
        this.endActiveMission();
        this.setCharacterMode(CONSTANTS.MODE_IDLE);
        this.scheduleNextMission();
        console.log('활성 미션 즉시 완료:', this.activeMission.text);
    }

    cleanup() {
        if (this.activeMissionTimer) clearTimeout(this.activeMissionTimer);
        if (this.nextMissionTimer) clearTimeout(this.nextMissionTimer);
        this.pendingMissions.forEach(mission => {
            if (mission.timerId) clearInterval(mission.timerId);
        });
        this.pendingMissions = [];
        this.activeMissionTimer = null;
        this.nextMissionTimer = null;
    }

    getDebugInfo() {
        return {
            currentMode: this.currentMode,
            isMissionActive: this.isMissionActive,
            activeMission: this.activeMission?.text || null,
            pendingCount: this.pendingMissions.length,
            pendingMissions: this.pendingMissions.map(m => m.text),
            maxPending: CONSTANTS.MAX_PENDING_MISSIONS
        };
    }
}


// ==========================================================================
// # 애플리케이션 초기화 및 실행
// ==========================================================================

// MissionManager의 단일 인스턴스(객체)를 생성합니다. 앱 전체에서 이 객체를 공유합니다.
const missionManager = new MissionManager();

// 하위 호환성 또는 간단한 테스트를 위한 전역 헬퍼 함수들
// 참고: 직접 버튼 등에 이 함수들을 연결하는 것보다,
// MissionManager 내부의 이벤트 리스너를 통해 기능을 실행하는 것이 더 좋은 구조입니다.
function showMission() { missionManager.showMission(); }
function completeMission() { missionManager.completeActiveMission(); }
function skipMission() { missionManager.moveToPending(); }

/**
 * 애플리케이션을 시작하는 메인 함수입니다.
 */
async function initializeApp() {
    console.log('Mission Buddy 시작 - 캐릭터 상시 표시 모드');
    
    // 외부 character.js 또는 유사 파일에 있을 것으로 가정하는 함수들
    await initializeCharacterSystem(); 
    
    await missionManager.initialize();
    
    // 앱 시작 후 일정 시간 뒤 첫 미션을 표시합니다.
    setTimeout(() => {
        missionManager.showMission();
    }, CONSTANTS.INITIAL_MISSION_DELAY);
    
    // 1시간마다 시간에 맞는 캐릭터 상태로 업데이트합니다.
    setInterval(updateCharacterByTime, 60 * 60 * 1000);
}

// HTML 문서 로딩이 완료되면 initializeApp 함수를 실행합니다.
document.addEventListener('DOMContentLoaded', initializeApp);


// ==========================================================================
// # 개발 및 디버깅 도구
// - 브라우저 콘솔에서 직접 호출하여 앱의 상태를 확인하거나 제어할 수 있습니다.
// ==========================================================================

if (typeof window !== 'undefined') {
    // 전역으로 missionManager 객체를 노출시켜 콘솔에서 직접 접근 가능하게 합니다.
    window.missionManager = missionManager;
    
    // 유용한 디버깅 함수 모음
    window.MissionUtils = {
        showDebug: () => console.log(missionManager.getDebugInfo()),
        forceMission: () => missionManager.showMission(),
        clearPending: () => {
            missionManager.pendingMissions.forEach(m => {
                if (m.timerId) clearInterval(m.timerId);
            });
            missionManager.pendingMissions = [];
            if (missionManager.ui.pendingContainer) {
                missionManager.ui.pendingContainer.innerHTML = '';
            }
            console.log('모든 완료 대기 미션이 제거되었습니다.');
        },
        testTransition: () => {
            missionManager.showMission();
            setTimeout(() => missionManager.moveToPending(), 2000);
        }
    };
}