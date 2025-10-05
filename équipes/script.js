// Données des équipes (seront chargées depuis le CSV)
let teamsData = [];
let studentsData = [];

// Mapping des peuples vers leurs conteneurs
const peopleContainers = {
    'Peuple de la forêt': 'teams-foret',
    'Peuple de la vallée': 'teams-vallee',
    'Peuple des collines': 'teams-collines',
    'Peuple du plateau rocheux': 'teams-plateau',
    'Peuple du bord de mer': 'teams-mer'
};

// Chargement et parsing du CSV
async function loadCSVData() {
    try {
        const response = await fetch('liste.csv');
        const csvText = await response.text();
        
        // Parser le CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        // Convertir les données en objets
        studentsData = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const student = {
                    nom: values[0]?.trim() || '',
                    prenom: values[1]?.trim() || '',
                    equipe: values[2]?.trim() || '',
                    peuplade: values[3]?.trim() || '',
                    nomVillage: values[4]?.trim() || '',
                    maitreSalle: values[5]?.trim() || ''
                };
                studentsData.push(student);
            }
        }
        
        // Organiser les données par peuple et équipe
        organizeTeamsData();
        
        // Afficher les équipes
        displayTeams();
        
        console.log(`Chargé ${studentsData.length} étudiants`);
        
    } catch (error) {
        console.error('Erreur lors du chargement du CSV:', error);
        // Si le fichier n'existe pas, utiliser des données de test
        loadTestData();
    }
}

function loadTestData() {
    studentsData = [
        { nom: 'MUSTIÈRE', prenom: 'Charlotte', equipe: '1', peuplade: 'Peuple de la forêt', maitreSalle: 'Quentin' },
        { nom: 'VAN MEURS', prenom: 'Rosa', equipe: '1', peuplade: 'Peuple de la forêt', maitreSalle: 'Quentin' },
        { nom: 'BIMBAKILA', prenom: 'Kyara', equipe: '7', peuplade: 'Peuple de la vallée', maitreSalle: 'Lionel' },
        { nom: 'GOMES MOREIRA', prenom: 'Harrison', equipe: '13', peuplade: 'Peuple des collines', maitreSalle: 'Lou' },
    ];
    
    organizeTeamsData();
    displayTeams();
}

// Organiser les données par peuple et équipe
function organizeTeamsData() {
    teamsData = {};
    
    studentsData.forEach(student => {
        const peuple = student.peuplade;
        const equipe = student.equipe;
        
        if (!teamsData[peuple]) {
            teamsData[peuple] = {};
        }
        
        if (!teamsData[peuple][equipe]) {
            teamsData[peuple][equipe] = [];
        }
        
        teamsData[peuple][equipe].push(student);
    });
}

// Afficher les équipes dans les colonnes
function displayTeams() {
    // Vider tous les conteneurs
    Object.values(peopleContainers).forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    });
    
    // Afficher chaque peuple
    Object.keys(teamsData).forEach(peuple => {
        const containerId = peopleContainers[peuple];
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        const teams = teamsData[peuple];
        const sortedTeamNumbers = Object.keys(teams).sort((a, b) => parseInt(a) - parseInt(b));
        
        sortedTeamNumbers.forEach(teamNumber => {
            const teamMembers = teams[teamNumber];
            const teamCard = createTeamCard(teamNumber, teamMembers);
            container.appendChild(teamCard);
        });
    });
}

// Créer une carte d'équipe
function createTeamCard(teamNumber, members) {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.setAttribute('data-team', teamNumber);
    
    const header = document.createElement('div');
    header.className = 'team-header';
    header.textContent = `Équipe ${teamNumber}`;
    
    const membersContainer = document.createElement('div');
    membersContainer.className = 'team-members';
    
    members.forEach(member => {
        const memberElement = document.createElement('div');
        memberElement.className = 'member';
        memberElement.setAttribute('data-student-name', `${member.nom} ${member.prenom}`.toLowerCase());
        memberElement.textContent = `${member.prenom} ${member.nom}`;
        membersContainer.appendChild(memberElement);
    });
    
    card.appendChild(header);
    card.appendChild(membersContainer);
    
    return card;
}

// Système de recherche
function setupSearch() {
    const searchInput = document.getElementById('studentSearch');
    const searchResult = document.getElementById('searchResult');
    
    if (!searchInput || !searchResult) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();
        
        // Réinitialiser les highlights
        clearHighlights();
        
        if (searchTerm.length < 2) {
            searchResult.classList.remove('show');
            return;
        }
        
        // Rechercher tous les étudiants correspondants
        const foundStudents = findStudents(searchTerm);
        
        if (foundStudents.length > 0) {
            showSearchResults(foundStudents, searchResult);
            // Highlighter tous les étudiants trouvés
            foundStudents.forEach(student => highlightStudent(student));
        } else {
            searchResult.classList.remove('show');
        }
    });
    
    // Cacher le résultat quand on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResult.contains(e.target)) {
            searchResult.classList.remove('show');
            clearHighlights();
        }
    });
}

// Rechercher tous les étudiants correspondants
function findStudents(searchTerm) {
    return studentsData.filter(student => {
        const fullName = `${student.prenom} ${student.nom}`.toLowerCase();
        const reverseName = `${student.nom} ${student.prenom}`.toLowerCase();
        return fullName.includes(searchTerm) || 
               reverseName.includes(searchTerm) ||
               student.nom.toLowerCase().includes(searchTerm) ||
               student.prenom.toLowerCase().includes(searchTerm);
    });
}

// Afficher tous les résultats de recherche
function showSearchResults(students, resultContainer) {
    if (students.length === 0) {
        resultContainer.classList.remove('show');
        return;
    }

    let html = `<small style="opacity: 0.8; margin-bottom: 8px; display: block;">👇 Clique sur ton nom pour voir ton équipe</small>`;
    
    students.forEach(student => {
        html += `
        <div class="search-result-item clickable" data-student='${JSON.stringify(student)}'>
            <strong>${student.prenom} ${student.nom}</strong><br>
            📍 ${student.peuplade}<br>
            👨‍🏫 Maître de salle: ${student.maitreSalle}<br>
            🏷️ Équipe ${student.equipe}
        </div>`;
    });

    if (students.length > 1) {
        html = `<small style="opacity: 0.8; margin-bottom: 8px; display: block;">${students.length} résultats trouvés</small>` + html;
    }

    resultContainer.innerHTML = html;
    resultContainer.classList.add('show');
    
    // Ajouter l'événement de clic à chaque résultat
    const resultItems = resultContainer.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
        item.addEventListener('click', () => {
            const studentData = JSON.parse(item.getAttribute('data-student'));
            scrollToStudent(studentData);
            resultContainer.classList.remove('show');
        });
    });
}

// Mettre en surbrillance l'étudiant trouvé (sans scroll)
function highlightStudent(student) {
    const studentName = `${student.nom} ${student.prenom}`.toLowerCase();
    
    // Trouver l'élément membre correspondant
    const memberElements = document.querySelectorAll('.member');
    memberElements.forEach(element => {
        if (element.getAttribute('data-student-name') === studentName) {
            element.classList.add('highlight');
            
            // Mettre en surbrillance la carte d'équipe
            const teamCard = element.closest('.team-card');
            if (teamCard) {
                teamCard.classList.add('highlight');
            }
        }
    });
}

// Faire défiler jusqu'à l'étudiant et le mettre en surbrillance
function scrollToStudent(student) {
    // D'abord nettoyer les anciens highlights
    clearHighlights();
    
    const studentName = `${student.nom} ${student.prenom}`.toLowerCase();
    
    // Trouver l'élément membre correspondant
    const memberElements = document.querySelectorAll('.member');
    let targetElement = null;
    
    memberElements.forEach(element => {
        if (element.getAttribute('data-student-name') === studentName) {
            element.classList.add('highlight');
            
            // Mettre en surbrillance la carte d'équipe
            const teamCard = element.closest('.team-card');
            if (teamCard) {
                teamCard.classList.add('highlight');
                targetElement = teamCard;
            }
        }
    });
    
    if (targetElement) {
        // Scroll horizontal vers la colonne
        const peopleColumn = targetElement.closest('.people-column');
        if (peopleColumn) {
            const peoplesGrid = document.querySelector('.peoples-grid');
            if (peoplesGrid) {
                // Calculer la position de scroll horizontal
                const columnRect = peopleColumn.getBoundingClientRect();
                const gridRect = peoplesGrid.getBoundingClientRect();
                const currentScroll = peoplesGrid.scrollLeft;
                
                const targetScroll = currentScroll + (columnRect.left - gridRect.left) - (gridRect.width / 2) + (columnRect.width / 2);
                
                // Scroll horizontal smooth
                peoplesGrid.scrollTo({
                    left: Math.max(0, targetScroll),
                    behavior: 'smooth'
                });
            }
        }
        
        // Scroll vertical vers la carte
        setTimeout(() => {
            targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 300); // Délai pour permettre le scroll horizontal d'abord
    }
}

// Supprimer les surbrillances
function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(element => {
        element.classList.remove('highlight');
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation de l\'application...');
    
    // Charger les données
    loadCSVData();
    
    // Configurer la recherche
    setupSearch();
});

// Fonction utilitaire pour recharger les données
function refreshData() {
    loadCSVData();
}

// Export pour debug
window.teamsData = teamsData;
window.studentsData = studentsData;
window.refreshData = refreshData;