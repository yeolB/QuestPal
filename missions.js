// 미션 목록 데이터 (텍스트, 소요시간(분))
const missions = {
    health: [
        { text: "5분간 깊게 숨쉬며 명상해보세요 🧘‍♀️", duration: 5 },
        { text: "창문을 열고 신선한 공기를 마셔보세요 🌬️", duration: 2 },
        { text: "물 한 잔 마시고 수분을 보충하세요 💧", duration: 1 },
        { text: "10분간 산책하며 몸을 움직여보세요 🚶‍♂️", duration: 10 },
        { text: "간단한 스트레칭으로 몸을 풀어보세요 🤸‍♀️", duration: 5 },
        { text: "목과 어깨를 천천히 돌려보세요 💆‍♂️", duration: 3 },
        { text: "눈 운동을 하며 눈의 피로를 풀어주세요 👀", duration: 2 },
        { text: "제자리에서 10번 점프해보세요 🦘", duration: 1 }
    ],
    
    productivity: [
        { text: "책상 정리를 하며 마음도 정리해보세요 📚", duration: 10 },
        { text: "스마트폰을 잠시 내려두고 주변을 둘러보세요 📱", duration: 5 },
        { text: "오늘의 목표 하나를 다시 확인해보세요 🎯", duration: 3 },
        { text: "완료한 일들을 정리하고 성취감을 느껴보세요 ✅", duration: 5 },
        { text: "다음 30분 할 일을 명확히 정해보세요 ⏰", duration: 5 },
        { text: "불필요한 브라우저 탭을 정리해보세요 🌐", duration: 3 }
    ],
    
    social: [
        { text: "가족이나 친구에게 안부 메시지를 보내보세요 💌", duration: 5 },
        { text: "동료에게 감사 인사를 전해보세요 🙏", duration: 3 },
        { text: "오늘 만난 사람에게 미소를 지어보세요 😊", duration: 1 },
        { text: "주변 사람의 좋은 점 하나를 찾아보세요 ❤️", duration: 2 }
    ],
    
    mindfulness: [
        { text: "좋은 일 하나를 떠올리며 감사해보세요 🙏", duration: 3 },
        { text: "지금 이 순간에 집중해보세요 ⭐", duration: 5 },
        { text: "오늘 잘한 일 하나를 칭찬해보세요 👏", duration: 3 },
        { text: "현재 느끼는 감정을 인정하고 받아들여보세요 💝", duration: 5 },
        { text: "주변의 소리에 귀 기울여보세요 👂", duration: 3 },
        { text: "지금 보이는 것들을 자세히 관찰해보세요 👁️", duration: 3 }
    ],
    
    creativity: [
        { text: "좋아하는 음악 한 곡 들으며 휴식하세요 🎵", duration: 4 },
        { text: "창밖 풍경을 바라보며 상상의 나래를 펼쳐보세요 🌅", duration: 5 },
        { text: "오늘 새롭게 배운 것을 떠올려보세요 💡", duration: 3 },
        { text: "재미있는 아이디어 하나를 메모해보세요 💭", duration: 5 },
        { text: "좋아하는 색깔을 떠올리고 그 느낌을 만끽해보세요 🎨", duration: 3 }
    ]
};

// 모든 미션을 하나의 배열로 합치는 함수
function getAllMissions() {
    const allMissions = [];
    for (const category in missions) {
        allMissions.push(...missions[category]);
    }
    return allMissions;
}

// 특정 카테고리의 미션만 가져오는 함수
function getMissionsByCategory(category) {
    return missions[category] || [];
}

// 카테고리 목록 가져오기
function getCategories() {
    return Object.keys(missions);
}

// 랜덤 미션 선택 (전체 또는 특정 카테고리)
function getRandomMission(category = null) {
    let missionPool;
    
    if (category && missions[category]) {
        missionPool = missions[category];
    } else {
        missionPool = getAllMissions();
    }
    
    const randomIndex = Math.floor(Math.random() * missionPool.length);
    return missionPool[randomIndex];
}