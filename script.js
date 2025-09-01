// Mission Buddy - ìºë¦­í„° ìƒì‹œ í‘œì‹œ ì‹œìŠ¤í…œ

class MissionManager {
    constructor() {
        this.activeMission = null;
        this.pendingMissions = [];
        this.maxPendingMissions = 5;
        this.activeMissionTimer = null;
        this.nextMissionTimer = null;
        this.isMissionActive = false;
        
        // DOM ìš”ì†Œë“¤
        this.characterContainer = null;
        this.character = null;
        this.speechBubble = null;
        this.missionText = null;
        this.timerDisplay = null;
        this.timerText = null;
        this.buttons = null;
        this.pendingContainer = null;
        
        // ìºë¦­í„° í‘œì‹œ ëª¨ë“œ
        this.characterModes = {
            IDLE: 'idle',           // ëŒ€ê¸° ëª¨ë“œ (ìºë¦­í„°ë§Œ)
            ACTIVE: 'active',       // ë¯¸ì…˜ í™œì„± ëª¨ë“œ (ìºë¦­í„° + ë§í’ì„ )
            TRANSITION: 'transition' // ì „í™˜ ëª¨ë“œ
        };
        
        this.currentMode = this.characterModes.IDLE;
    }
    
    // ì´ˆê¸°í™”
    async initialize() {
        this.characterContainer = document.getElementById('characterContainer');
        this.character = document.getElementById('character');
        this.speechBubble = document.getElementById('speechBubble');
        this.missionText = document.getElementById('missionText');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerText = document.getElementById('timerText');
        this.buttons = document.querySelector('.buttons');
        
        if (!this.characterContainer || !this.character || !this.speechBubble) {
            console.error('í•„ìˆ˜ DOM ìš”ì†Œë¥¼ ì°¾ì„ ìˆ˜ ì—†ìŠµë‹ˆë‹¤.');
            return false;
        }
        
        // ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ ì»¨í…Œì´ë„ˆ ìƒì„±
        this.createPendingContainer();
        
        // ìºë¦­í„° ìƒì‹œ í‘œì‹œ ì„¤ì •
        this.setupPersistentCharacter();
        
        // ì´ë²¤íŠ¸ ë¦¬ìŠ¤ë„ˆ ì„¤ì •
        this.setupEventListeners();
        
        console.log('ë¯¸ì…˜ ë§¤ë‹ˆì € ì´ˆê¸°í™” ì™„ë£Œ - ìºë¦­í„° ìƒì‹œ í‘œì‹œ');
        return true;
    }
    
    // ìºë¦­í„° ìƒì‹œ í‘œì‹œ ì„¤ì •
    setupPersistentCharacter() {
        // ìºë¦­í„° ì»¨í…Œì´ë„ˆë¥¼ í•­ìƒ í‘œì‹œ
        this.characterContainer.classList.add('persistent');
        
        // ëŒ€ê¸° ëª¨ë“œë¡œ ì‹œìž‘
        this.setCharacterMode(this.characterModes.IDLE);
        
        console.log('ìºë¦­í„° ìƒì‹œ í‘œì‹œ ëª¨ë“œ í™œì„±í™”');
    }
    
    // ìºë¦­í„° í‘œì‹œ ëª¨ë“œ ë³€ê²½
    setCharacterMode(mode) {
        this.currentMode = mode;
        
        // ëª¨ë“  ëª¨ë“œ í´ëž˜ìŠ¤ ì œê±°
        this.characterContainer.classList.remove('idle-mode', 'active-mode', 'transition-mode');
        
        switch(mode) {
            case this.characterModes.IDLE:
                this.characterContainer.classList.add('idle-mode');
                this.speechBubble.classList.remove('show');
                this.buttons.style.display = 'none';
                this.timerDisplay.style.display = 'none';
                console.log('ìºë¦­í„° ëª¨ë“œ: ëŒ€ê¸°');
                break;
                
            case this.characterModes.ACTIVE:
                this.characterContainer.classList.add('active-mode');
                this.speechBubble.classList.add('show');
                this.buttons.style.display = 'none'; // í™œì„± ìƒíƒœì—ì„œëŠ” ë²„íŠ¼ ì—†ìŒ
                this.timerDisplay.style.display = 'none'; // í™œì„± ìƒíƒœì—ì„œëŠ” íƒ€ì´ë¨¸ ì—†ìŒ
                console.log('ìºë¦­í„° ëª¨ë“œ: ë¯¸ì…˜ í™œì„±');
                break;
                
            case this.characterModes.TRANSITION:
                this.characterContainer.classList.add('transition-mode');
                console.log('ìºë¦­í„° ëª¨ë“œ: ì „í™˜');
                break;
        }
    }
    
    // ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ ì»¨í…Œì´ë„ˆ ìƒì„±
    createPendingContainer() {
        this.pendingContainer = document.createElement('div');
        this.pendingContainer.className = 'pending-missions-container';
        this.pendingContainer.id = 'pendingMissions';
        document.querySelector('.container').appendChild(this.pendingContainer);
    }
    
    // ì´ë²¤íŠ¸ ë¦¬ìŠ¤ë„ˆ ì„¤ì •
    setupEventListeners() {
        // ìºë¦­í„° í´ë¦­ìœ¼ë¡œ ë¯¸ì…˜ ê°•ì œ í‘œì‹œ
        this.character?.addEventListener('click', () => {
            if (!this.isMissionActive) {
                this.showMission();
            } else {
                this.moveToPending();
            }
        });
        
        // í‚¤ë³´ë“œ ë‹¨ì¶•í‚¤
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMissionActive) {
                this.moveToPending();
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (!this.isMissionActive) {
                    this.showMission();
                }
            }
        });
    }
    
    // ìƒˆ ë¯¸ì…˜ í‘œì‹œ
    showMission() {
        if (this.isMissionActive) return;
        
        // ëžœë¤ ë¯¸ì…˜ ì„ íƒ
        this.activeMission = this.createMissionObject(getRandomMission());
        this.missionText.textContent = this.activeMission.text;
        
        // ë¯¸ì…˜ íƒ€ìž…ì— ë”°ë¥¸ ìºë¦­í„° ìƒíƒœ ë³€ê²½
        const category = this.getMissionCategory(this.activeMission.text);
        setCharacterState('thinking');
        
        // ë¯¸ì…˜ í™œì„± ëª¨ë“œë¡œ ì „í™˜
        this.setCharacterMode(this.characterModes.ACTIVE);
        this.isMissionActive = true;
        
        // 1ì´ˆ í›„ ë¯¸ì…˜ íƒ€ìž…ë³„ ìºë¦­í„°ë¡œ ë³€ê²½
        setTimeout(() => {
            updateCharacterForMission(category);
        }, 1000);
        
        // 10ì´ˆ í›„ ìžë™ìœ¼ë¡œ ì™„ë£Œ ëŒ€ê¸°ë¡œ ì „í™˜
        this.activeMissionTimer = setTimeout(() => {
            this.moveToPending();
        }, 10000);
        
        console.log('í™œì„± ë¯¸ì…˜ í‘œì‹œ:', this.activeMission.text);
    }
    
    // ë¯¸ì…˜ ê°ì²´ ìƒì„±
    createMissionObject(missionData) {
        return {
            id: Date.now() + Math.random(),
            text: missionData.text,
            duration: missionData.duration,
            createdAt: new Date(),
            remainingTime: missionData.duration * 60
        };
    }
    
    // ì™„ë£Œ ëŒ€ê¸°ë¡œ ì´ë™
    moveToPending() {
        if (!this.isMissionActive || !this.activeMission) return;
        
        // ìµœëŒ€ ê°œìˆ˜ í™•ì¸
        if (this.pendingMissions.length >= this.maxPendingMissions) {
            const oldestMission = this.pendingMissions.shift();
            this.removePendingMissionUI(oldestMission.id);
            console.log('ê°€ìž¥ ì˜¤ëž˜ëœ ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ ì œê±°:', oldestMission.text);
        }
        
        // ì™„ë£Œ ëŒ€ê¸° ëª©ë¡ì— ì¶”ê°€
        this.pendingMissions.push(this.activeMission);
        
        // ì™„ë£Œ ëŒ€ê¸° UI ìƒì„±
        this.createPendingMissionUI(this.activeMission);
        
        // ì „í™˜ ì• ë‹ˆë©”ì´ì…˜ ì‹œìž‘
        this.animateTransition();
        
        console.log('ì™„ë£Œ ëŒ€ê¸°ë¡œ ì´ë™:', this.activeMission.text);
        console.log('í˜„ìž¬ ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ ìˆ˜:', this.pendingMissions.length);
    }
    
    // ì „í™˜ ì• ë‹ˆë©”ì´ì…˜
    animateTransition() {
        // ì „í™˜ ëª¨ë“œë¡œ ë³€ê²½
        this.setCharacterMode(this.characterModes.TRANSITION);
        
        // ë§í’ì„ ì„ ìš°ì¸¡ ìƒë‹¨ìœ¼ë¡œ ì´ë™í•˜ëŠ” ì• ë‹ˆë©”ì´ì…˜
        this.speechBubble.classList.add('moving-to-pending');
        
        setTimeout(() => {
            // í™œì„± ë¯¸ì…˜ ì¢…ë£Œ
            this.endActiveMission();
            
            // ëŒ€ê¸° ëª¨ë“œë¡œ ë³µê·€
            this.setCharacterMode(this.characterModes.IDLE);
            
            // ë§í’ì„  ì• ë‹ˆë©”ì´ì…˜ í´ëž˜ìŠ¤ ì œê±°
            this.speechBubble.classList.remove('moving-to-pending');
            
            // ë‹¤ìŒ ë¯¸ì…˜ ìŠ¤ì¼€ì¤„
            this.scheduleNextMission();
        }, 800);
    }
    
    // í™œì„± ë¯¸ì…˜ ì¢…ë£Œ
    endActiveMission() {
        // íƒ€ì´ë¨¸ ì •ë¦¬
        if (this.activeMissionTimer) {
            clearTimeout(this.activeMissionTimer);
            this.activeMissionTimer = null;
        }
        
        this.isMissionActive = false;
        this.activeMission = null;
        
        // ì‹œê°„ëŒ€ë³„ ìºë¦­í„° ìƒíƒœë¡œ ë³µê·€
        updateCharacterByTime();
    }
    
    // ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ UI ìƒì„±
    createPendingMissionUI(mission) {
        const pendingItem = document.createElement('div');
        pendingItem.className = 'pending-mission-item';
        pendingItem.dataset.missionId = mission.id;
        
        pendingItem.innerHTML = `
            <div class="pending-mission-content">
                <p class="pending-mission-text">${mission.text}</p>
                <div class="pending-mission-timer">
                    <span class="pending-timer-text">${this.formatTime(mission.remainingTime)}</span>
                </div>
            </div>
            <button class="pending-complete-btn" onclick="missionManager.completePendingMission('${mission.id}')">
                ì™„ë£Œ
            </button>
        `;
        
        // ì• ë‹ˆë©”ì´ì…˜ìœ¼ë¡œ ì¶”ê°€
        pendingItem.style.opacity = '0';
        pendingItem.style.transform = 'translateX(50px)';
        this.pendingContainer.appendChild(pendingItem);
        
        // íƒ€ì´ë¨¸ ì‹œìž‘
        this.startPendingTimer(mission.id);
        
        setTimeout(() => {
            pendingItem.style.opacity = '1';
            pendingItem.style.transform = 'translateX(0)';
        }, 100);
    }
    
    // ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ íƒ€ì´ë¨¸ ì‹œìž‘
    startPendingTimer(missionId) {
        const mission = this.pendingMissions.find(m => m.id === missionId);
        if (!mission) return;
        
        const interval = setInterval(() => {
            mission.remainingTime--;
            
            const timerElement = document.querySelector(`[data-mission-id="${missionId}"] .pending-timer-text`);
            if (timerElement) {
                timerElement.textContent = this.formatTime(mission.remainingTime);
            }
            
            if (mission.remainingTime <= 0) {
                clearInterval(interval);
                this.autoCompletePendingMission(missionId);
            }
        }, 1000);
        
        mission.timerId = interval;
    }
    
    // ì‹œê°„ í¬ë§·íŒ…
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ ì™„ë£Œ
    completePendingMission(missionId) {
        const missionIndex = this.pendingMissions.findIndex(m => m.id == missionId);
        if (missionIndex === -1) return;
        
        const mission = this.pendingMissions[missionIndex];
        
        if (mission.timerId) {
            clearInterval(mission.timerId);
        }
        
        this.updateMissionStats('completed');
        this.pendingMissions.splice(missionIndex, 1);
        this.removePendingMissionUI(missionId);
        this.showCompletionFeedback('ì™„ë£Œ! ðŸŽ‰', mission.text);
        
        console.log('ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ ì™„ë£Œ:', mission.text);
    }
    
    // ìžë™ ì™„ë£Œ (ì‹œê°„ ì¢…ë£Œ)
    autoCompletePendingMission(missionId) {
        const missionIndex = this.pendingMissions.findIndex(m => m.id == missionId);
        if (missionIndex === -1) return;
        
        const mission = this.pendingMissions[missionIndex];
        
        this.updateMissionStats('auto_completed');
        this.pendingMissions.splice(missionIndex, 1);
        this.removePendingMissionUI(missionId);
        
        console.log('ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ ì‹œê°„ ì¢…ë£Œ:', mission.text);
    }
    
    // ì™„ë£Œ ëŒ€ê¸° ë¯¸ì…˜ UI ì œê±°
    removePendingMissionUI(missionId) {
        const element = document.querySelector(`[data-mission-id="${missionId}"]`);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(50px)';
            setTimeout(() => element.remove(), 300);
        }
    }
    
    // ë‹¤ìŒ ë¯¸ì…˜ ìŠ¤ì¼€ì¤„ë§
    scheduleNextMission() {
        const minDelay = 30 * 1000; // 30ì´ˆ
        const maxDelay = 5 * 60 * 1000; // 5ë¶„
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;
        
        console.log(`ë‹¤ìŒ ë¯¸ì…˜ê¹Œì§€ ${Math.round(delay/1000)}ì´ˆ`);
        
        this.nextMissionTimer = setTimeout(() => {
            this.showMission();
        }, delay);
    }
    
    // ë¯¸ì…˜ ì¹´í…Œê³ ë¦¬ ì°¾ê¸°
    getMissionCategory(missionText) {
        for (const [category, missionList] of Object.entries(missions)) {
            if (missionList.some(mission => mission.text === missionText)) {
                return category;
            }
        }
        return 'default';
    }
    
    // í†µê³„ ì—…ë°ì´íŠ¸
    updateMissionStats(action) {
        try {
            const stats = JSON.parse(localStorage.getItem('missionStats')) || {
                completed: 0,
                skipped: 0,
                auto_completed: 0,
                total: 0
            };
            
            stats[action]++;
            stats.total++;
            localStorage.setItem('missionStats', JSON.stringify(stats));
            
        } catch (error) {
            console.error('í†µê³„ ì €ìž¥ ì˜¤ë¥˜:', error);
        }
    }
    
    // ì™„ë£Œ í”¼ë“œë°± í‘œì‹œ
    showCompletionFeedback(message, missionText) {
        // ìž„ì‹œë¡œ ìºë¦­í„° ìƒíƒœë¥¼ celebratingìœ¼ë¡œ ë³€ê²½
        setCharacterState('celebrating');
        
        // 2ì´ˆ í›„ ì›ëž˜ ìƒíƒœë¡œ ë³µê·€
        setTimeout(() => {
            updateCharacterByTime();
        }, 2000);
        
        console.log(`${message} - ${missionText}`);
    }
    
    // ì¦‰ì‹œ ì™„ë£Œ (í™œì„± ë¯¸ì…˜)
    completeActiveMission() {
        if (!this.isMissionActive || !this.activeMission) return;
        
        this.updateMissionStats('completed');
        this.showCompletionFeedback('ì¦‰ì‹œ ì™„ë£Œ! ðŸŽ‰', this.activeMission.text);
        
        // ì „í™˜ ì—†ì´ ë°”ë¡œ ëŒ€ê¸° ëª¨ë“œë¡œ
        this.endActiveMission();
        this.setCharacterMode(this.characterModes.IDLE);
        this.scheduleNextMission();
        
        console.log('í™œì„± ë¯¸ì…˜ ì¦‰ì‹œ ì™„ë£Œ:', this.activeMission.text);
    }
    
    // ê°•ì œ ì •ë¦¬
    cleanup() {
        if (this.activeMissionTimer) {
            clearTimeout(this.activeMissionTimer);
            this.activeMissionTimer = null;
        }
        
        if (this.nextMissionTimer) {
            clearTimeout(this.nextMissionTimer);
            this.nextMissionTimer = null;
        }
        
        this.pendingMissions.forEach(mission => {
            if (mission.timerId) {
                clearInterval(mission.timerId);
            }
        });
        
        this.pendingMissions = [];
    }
    
    // ë””ë²„ê·¸ ì •ë³´
    getDebugInfo() {
        return {
            currentMode: this.currentMode,
            isMissionActive: this.isMissionActive,
            activeMission: this.activeMission?.text || null,
            pendingCount: this.pendingMissions.length,
            pendingMissions: this.pendingMissions.map(m => m.text),
            maxPending: this.maxPendingMissions
        };
    }
}

// ì „ì—­ ë¯¸ì…˜ ë§¤ë‹ˆì € ì¸ìŠ¤í„´ìŠ¤
const missionManager = new MissionManager();

// ê¸°ì¡´ í•¨ìˆ˜ë“¤ (í•˜ìœ„ í˜¸í™˜ì„±)
function showMission() {
    missionManager.showMission();
}

function completeMission() {
    missionManager.completeActiveMission();
}

function skipMission() {
    missionManager.moveToPending();
}

// ë©”ì¸ ì• í”Œë¦¬ì¼€ì´ì…˜ ì´ˆê¸°í™”
async function initializeApp() {
    console.log('Mission Buddy ì‹œìž‘ - ìºë¦­í„° ìƒì‹œ í‘œì‹œ ëª¨ë“œ');
    
    // ìŠ¤íƒ€ì¼ ì¶”ê°€
    addRequiredStyles();
    
    // ìºë¦­í„° ì‹œìŠ¤í…œ ì´ˆê¸°í™”
    await initializeCharacterSystem();
    
    // ë¯¸ì…˜ ë§¤ë‹ˆì € ì´ˆê¸°í™”
    await missionManager.initialize();
    
    // 2ì´ˆ í›„ ì²« ë²ˆì§¸ ë¯¸ì…˜ í‘œì‹œ
    setTimeout(() => {
        missionManager.showMission();
    }, 2000);
    
    // 1ì‹œê°„ë§ˆë‹¤ ì‹œê°„ëŒ€ë³„ ìºë¦­í„° ìƒíƒœ ì—…ë°ì´íŠ¸
    setInterval(updateCharacterByTime, 60 * 60 * 1000);
}

// 필요한 스타일 추가
function addRequiredStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* ======================
           컨테이너 공간 확장
           ====================== */
        
        .container {
            min-height: 100vh;
            padding: 40px 100px; /* 여유 공간 확보 */
        }
        
        /* ==================================
        개선된 캐릭터 및 말풍선 스타일
        ================================== */

        /* 캐릭터를 담는 전체 컨테이너 */
        .character-container {
            /* position을 기준으로 내부 요소를 배치하기 위함 */
            position: relative; 
            
            /* 캐릭터 크기에 맞춰 컨테이너의 크기 설정 */
            /* 예시: 캐릭터의 원래 크기가 100px x 120px 였다면 1.8배로 계산 */
            width: 180px;  /* 100px * 1.8 */
            height: 180px; /* 120px * 1.8 */
            
            /* transform 대신 width/height를 사용했으므로 불필요한 transform 제거 */
        }

        /* 캐릭터 이미지 또는 애니메이션 자체 */
        .character {
            /* 컨테이너를 꽉 채우도록 설정 */
            width: 100%;
            height: 100%;
            object-fit: contain; /* 이미지 비율을 유지하면서 컨테이너에 맞춤 */
        }


        /* Mission Buddy의 JavaScript가 추가하는 클래스 */
        .character-container.persistent {
            opacity: 1;
            /* transform은 이제 위치 이동이나 다른 효과에만 사용 (scale 불필요) */
            transform: translateX(0); 
            pointer-events: auto;
        }
        
        /* 호버 효과는 크기 변화로만 처리 */
        .character-container.idle-mode .character {
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .character-container.idle-mode .character:hover {
            transform: scale(1.1);
        }
        
        /* ======================
           완료 대기 미션 표시 개선
           ====================== */
    
        .pending-missions-container {
            position: fixed;
            top: 30px;
            right: 15px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-width: 380px;
            max-height: calc(100vh - 100px);
            overflow-y: auto;
            padding-right: 8px;
        }

        /* 스크롤바 스타일링 */
        .pending-missions-container::-webkit-scrollbar { width: 6px; }
        .pending-missions-container::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
        .pending-missions-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 3px; }
        .pending-missions-container::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
        
        /* ======================
           완료 대기 미션 아이템 개선
           ====================== */
        
        .pending-mission-item {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            opacity: 0.9;
            min-height: 60px; /* 최소 높이 보장 */
            flex-shrink: 0; /* 항목 크기 고정 */
        }
        
        .pending-mission-item:hover {
            opacity: 1;
            transform: translateX(-8px) scale(1.02);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
            border-color: rgba(255, 255, 255, 0.4);
        }
        
        /* ======================
           완료 대기 미션 내용 개선
           ====================== */
        
        .pending-mission-content {
            flex: 1;
            color: white;
            min-width: 0; /* 텍스트 오버플로우 방지 */
        }
        
        .pending-mission-text {
            margin: 0 0 10px 0;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 500;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .pending-mission-timer {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.9);
            background: rgba(255, 255, 255, 0.15);
            padding: 6px 10px;
            border-radius: 10px;
            display: inline-block;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* ======================
           완료 대기 미션 버튼 개선
           ====================== */
        
        .pending-complete-btn {
            background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
            border: none;
            border-radius: 12px;
            padding: 10px 18px;
            font-size: 13px;
            color: white;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            white-space: nowrap;
            font-weight: 600;
            box-shadow: 0 2px 10px rgba(79, 172, 254, 0.2);
            flex-shrink: 0; /* 버튼 크기 고정 */
        }
        
        .pending-complete-btn:hover {
            transform: scale(1.08) translateY(-1px);
            box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
            background: linear-gradient(45deg, #5bb6ff 0%, #1affff 100%);
        }
        
        .pending-complete-btn:active {
            transform: scale(1.02) translateY(0px);
            transition: all 0.1s ease;
        }
        
        /* ======================
           전환 애니메이션 개선
           ====================== */
        
        .character-container.transition-mode .speech-bubble {
            animation: improvedMoveToTopRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        @keyframes improvedMoveToTopRight {
            0% { 
                transform: scale(1) translate(0, 0);
                opacity: 1;
            }
            30% {
                transform: scale(0.9) translate(50px, -100px);
                opacity: 0.8;
            }
            70% {
                transform: scale(0.5) translate(150px, -250px);
                opacity: 0.5;
            }
            100% { 
                transform: scale(0.3) translate(220px, -350px);
                opacity: 0.2;
            }
        }
        
        .speech-bubble.moving-to-pending {
            animation: smoothImprovedMoveToTop 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        @keyframes smoothImprovedMoveToTop {
            0% { 
                transform: scale(1) translate(0, 0);
                opacity: 1;
            }
            25% {
                transform: scale(0.85) translate(60px, -80px);
                opacity: 0.9;
            }
            50% {
                transform: scale(0.6) translate(120px, -180px);
                opacity: 0.6;
            }
            75% {
                transform: scale(0.4) translate(180px, -280px);
                opacity: 0.3;
            }
            100% { 
                transform: scale(0.25) translate(240px, -380px);
                opacity: 0;
            }
        }
        
        /* ======================
           접근성 개선
           ====================== */
        
        .pending-complete-btn:focus {
            outline: 3px solid rgba(79, 172, 254, 0.6);
            outline-offset: 2px;
        }
        
        /* 고대비 모드 지원 */
        @media (prefers-contrast: high) {
            .pending-mission-item {
                border: 2px solid rgba(255, 255, 255, 0.8);
                background: rgba(102, 126, 234, 1);
            }
            
            .pending-complete-btn {
                border: 2px solid white;
            }
        }
        
        /* 모션 감소 선호 시 애니메이션 단순화 */
        @media (prefers-reduced-motion: reduce) {
            .character-container.transition-mode .speech-bubble,
            .speech-bubble.moving-to-pending,
            .pending-mission-item,
            .pending-complete-btn,
            .character-container.idle-mode .character {
                animation: none;
                transition: none;
            }
            
            .pending-mission-item:hover {
                transform: none;
            }
            
            .pending-complete-btn:hover {
                transform: none;
            }
        }
        
        /* ======================
           성능 최적화
           ====================== */
        
        .pending-missions-container,
        .pending-mission-item,
        .character-container {
            will-change: transform;
            backface-visibility: hidden;
        }
        
        /* GPU 가속 활성화 */
        .character-container,
        .speech-bubble,
        .pending-mission-item {
            transform-style: preserve-3d;
        }
    `;
    
    document.head.appendChild(style);
}


// 추가적인 유틸리티 함수들
const StyleUtils = {
    // 동적으로 캐릭터 크기 조정
    setCharacterScale: (scale) => {
        const containers = document.querySelectorAll('.character-container');
        containers.forEach(container => {
            container.style.transform = container.style.transform.replace(/scale\([^)]*\)/, `scale(${scale})`);
        });
    },
    
    // 완료 대기 미션 컨테이너 위치 조정
    setPendingPosition: (top, right) => {
        const container = document.querySelector('.pending-missions-container');
        if (container) {
            container.style.top = top + 'px';
            container.style.right = right + 'px';
        }
    },
    
    // 완료 대기 미션 최대 개수 표시 확인
    checkPendingOverflow: () => {
        const container = document.querySelector('.pending-missions-container');
        if (container) {
            const isScrolling = container.scrollHeight > container.clientHeight;
            console.log('완료 대기 미션 스크롤 상태:', isScrolling ? '스크롤 필요' : '모두 표시됨');
            return isScrolling;
        }
        return false;
    }
};

// 전역으로 스타일 유틸리티 노출
if (typeof window !== 'undefined') {
    window.StyleUtils = StyleUtils;
}

// DOM ë¡œë“œ ì™„ë£Œ ì‹œ ì‹¤í–‰
document.addEventListener('DOMContentLoaded', initializeApp);

// ê°œë°œ ë„êµ¬
if (typeof window !== 'undefined') {
    window.missionManager = missionManager;
    window.MissionUtils = {
        showDebug: () => console.log(missionManager.getDebugInfo()),
        forceMission: () => missionManager.showMission(),
        clearPending: () => {
            missionManager.pendingMissions.forEach(m => {
                if (m.timerId) clearInterval(m.timerId);
            });
            missionManager.pendingMissions = [];
            document.getElementById('pendingMissions').innerHTML = '';
        },
        testTransition: () => {
            missionManager.showMission();
            setTimeout(() => missionManager.moveToPending(), 2000);
        }
    };
}
