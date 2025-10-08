// ===========================
// CONFIGURATION - NOMBRE D'ALLIÉS AUTORISÉS
// ===========================
// 0 = Pas d'alliés
const MAX_ALLIES_ATTAQUANT = 2; 
const MAX_ALLIES_DEFENSEUR = 2;

// Variables pour gérer plusieurs alliés
let attaquantAlliesCount = 0;
let defenseurAlliesCount = 0;

// Fonctions utilitaires pour la configuration dynamique
function isAlliesEnabled(type) {
    const maxAllies = type === 'attaquant' ? MAX_ALLIES_ATTAQUANT : MAX_ALLIES_DEFENSEUR;
    return maxAllies > 0;
}

function isClassicMode(type) {
    const maxAllies = type === 'attaquant' ? MAX_ALLIES_ATTAQUANT : MAX_ALLIES_DEFENSEUR;
    return maxAllies === 1;
}

function isMultipleMode(type) {
    const maxAllies = type === 'attaquant' ? MAX_ALLIES_ATTAQUANT : MAX_ALLIES_DEFENSEUR;
    return maxAllies > 1;
}

function getMaxAllies(type) {
    return type === 'attaquant' ? MAX_ALLIES_ATTAQUANT : MAX_ALLIES_DEFENSEUR;
}

let gameData = {};

// ===========================
// INITIALISATION CONFIGURATION
// ===========================
function initializeAlliesConfiguration() {
    // Configurer les boutons selon les constantes
    const attaquantButton = document.getElementById('toggle-attaquant-allie-btn');
    const defenseurButton = document.getElementById('toggle-allie-btn');
    
    if (attaquantButton) {
        attaquantButton.style.display = isAlliesEnabled('attaquant') ? '' : 'none';
    }
    
    if (defenseurButton) {
        defenseurButton.style.display = isAlliesEnabled('defenseur') ? '' : 'none';
    }
    
    // Mettre à jour les boutons initialement
    updateAllieButton('attaquant');
    updateAllieButton('defenseur');
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeAlliesConfiguration();
});

// ===========================
// GESTION ALLIÉS MULTIPLES
// ===========================
function createAllieElement(type, index) {
    if (!isMultipleMode(type)) return null;
    
    const prefix = type === 'attaquant' ? 'attaquant' : 'defenseur';
    const emoji = type === 'attaquant' ? '🤺' : '🛡️';
    
    const allieDiv = document.createElement('div');
    allieDiv.className = `${prefix}-allie-box`;
    allieDiv.id = `${prefix}${index + 3}-box`; // +3 car index 2 est réservé pour l'allié classique
    allieDiv.style.cssText = 'max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out;';
    
    allieDiv.innerHTML = `
        <div class="form-group" style="display: flex; align-items: flex-end; gap: 8px;">
            <div style="flex: 1;">
                <label for="${prefix}${index + 3}-nom">${emoji} Nom de l'allié ${index + 2} <span id="${prefix}${index + 3}-nom-star">*</span></label>
                <input type="text" id="${prefix}${index + 3}-nom" placeholder="Ex: Les Guerriers">
            </div>
            <button type="button" class="remove-allie-btn" onclick="removeAllieByElementId('${prefix}${index + 3}-box')" style="padding: 6px 10px; background: #d73a49; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em; white-space: nowrap; height: fit-content;">
                ✕ Retirer
            </button>
        </div>
        <div class="village-grid">
            <div class="form-group ${type === 'defenseur' ? 'guerrier-half' : ''}">
                <label for="${prefix}${index + 3}-guerriers">🧝 Guerriers ${type === 'attaquant' ? 'mobilisés' : 'alliés'}<span id="${prefix}${index + 3}-guerriers-star">*</span></label>
                <input type="number" id="${prefix}${index + 3}-guerriers" min="0" value="" placeholder="0">
            </div>
            ${type === 'attaquant' ? `
            <div class="form-group">
                <label for="${prefix}${index + 3}-potions">🧪 Potions utilisées <span id="${prefix}${index + 3}-potions-max-label">(Max: <span id="${prefix}${index + 3}-potions-max">0</span>)</span></label>
                <input type="number" id="${prefix}${index + 3}-potions" min="0" value="0" placeholder="0">
            </div>
            ` : ''}
        </div>
    `;
    
    return allieDiv;
}

function addAllie(type) {
    if (!isMultipleMode(type)) return;
    
    // En mode alliés multiples, d'abord vérifier s'il faut afficher l'allié classique
    const classicAllieBox = type === 'attaquant' 
        ? document.getElementById('attaquant-allie-box')
        : document.getElementById('defenseur-allie-box');
        
    if (classicAllieBox && !classicAllieBox.classList.contains('visible')) {
        // Afficher l'allié classique en premier
        classicAllieBox.style.maxHeight = classicAllieBox.scrollHeight + "px";
        classicAllieBox.classList.add('visible');
        updateTitre(type);
        checkPreparatifsValidity();
        return;
    }
    
    const count = type === 'attaquant' ? attaquantAlliesCount : defenseurAlliesCount;
    const maxAllies = getMaxAllies(type);
    if (count >= maxAllies) {
        alert(`Maximum ${maxAllies} alliés par camp autorisés`);
        return;
    }
    
    const container = type === 'attaquant' 
        ? document.querySelector('.attaquant-section')
        : document.querySelector('.defenseur-section');
    
    if (!container) {
        console.error(`Conteneur .${type}-section non trouvé`);
        return;
    }
    
    const allieElement = createAllieElement(type, count);
    if (allieElement) {
        // Stratégie simple et robuste : toujours ajouter à la fin
        // Cela évite les problèmes d'insertBefore avec les DOM complexes
        container.appendChild(allieElement);
        
        // Ajouter l'animation d'entrée
        allieElement.classList.add('nouveau');
        
        // Animer l'ouverture
        setTimeout(() => {
            allieElement.style.maxHeight = allieElement.scrollHeight + "px";
            allieElement.classList.add('visible');
        }, 10);
        
        // Retirer la classe d'animation après l'animation
        setTimeout(() => {
            allieElement.classList.remove('nouveau');
        }, 400);
        
        if (type === 'attaquant') {
            attaquantAlliesCount++;
            setupPotionLimits(count + 3); // +3 car les nouveaux alliés sont à index+3
        } else {
            defenseurAlliesCount++;
        }
        
        // Mise à jour du bouton et titre
        updateAllieButton(type);
        updateTitre(type);
        
        // Ajouter les écouteurs d'événements pour la validation
        setupFieldListeners(type, count + 3);
        checkPreparatifsValidity();
    }
}

function removeAllieByElementId(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Extraire le type depuis l'ID de l'élément (attaquant3-box -> attaquant)
    const type = elementId.startsWith('attaquant') ? 'attaquant' : 'defenseur';
    
    // Gérer l'allié classique différemment (attaquant-allie-box, defenseur-allie-box)
    if (elementId === 'attaquant-allie-box' || elementId === 'defenseur-allie-box') {
        // Pour l'allié classique, on cache l'élément et vide les champs
        element.classList.remove('visible');
        element.style.maxHeight = '0px';
        
        // Vider les champs
        const nomField = document.getElementById(`${type}2-nom`);
        const guerriersField = document.getElementById(`${type}2-guerriers`);
        if (nomField) nomField.value = '';
        if (guerriersField) guerriersField.value = '';
        
        if (type === 'attaquant') {
            const potionsField = document.getElementById(`${type}2-potions`);
            if (potionsField) potionsField.value = '';
        }
        
        // Mettre à jour le bouton d'ajout
        const toggleButtonId = type === 'attaquant' ? 'toggle-attaquant-allie-btn' : 'toggle-allie-btn';
        const toggleButton = document.getElementById(toggleButtonId);
        if (toggleButton) {
            toggleButton.textContent = `+ Ajouter un ${type} allié (optionnel)`;
        }
        
        updateAllieButton(type);
        updateTitre(type);
        checkPreparatifsValidity();
        return;
    }
    
    if (!isMultipleMode(type)) return;
    
    // Extraire l'index depuis l'ID (attaquant3-box -> 3)
    const matches = elementId.match(/(\d+)-box$/);
    if (!matches) return;
    const removedIndex = parseInt(matches[1]);
    
    // Supprimer seulement l'élément cliqué
    element.remove();
    
    // Réajuster les IDs des éléments suivants pour combler le trou
    const currentCount = type === 'attaquant' ? attaquantAlliesCount : defenseurAlliesCount;
    
    for (let i = removedIndex + 1; i <= currentCount + 2; i++) {
        const currentElement = document.getElementById(`${type}${i}-box`);
        if (currentElement) {
            const newIndex = i - 1;
            
            // Changer l'ID de l'élément container
            currentElement.id = `${type}${newIndex}-box`;
            
            // Changer tous les IDs des champs à l'intérieur
            const nomField = currentElement.querySelector(`#${type}${i}-nom`);
            const guerriersField = currentElement.querySelector(`#${type}${i}-guerriers`);
            const potionsField = currentElement.querySelector(`#${type}${i}-potions`);
            
            if (nomField) {
                nomField.id = `${type}${newIndex}-nom`;
                const label = currentElement.querySelector(`label[for="${type}${i}-nom"]`);
                if (label) label.setAttribute('for', `${type}${newIndex}-nom`);
            }
            
            if (guerriersField) {
                guerriersField.id = `${type}${newIndex}-guerriers`;
                const label = currentElement.querySelector(`label[for="${type}${i}-guerriers"]`);
                if (label) label.setAttribute('for', `${type}${newIndex}-guerriers`);
            }
            
            if (potionsField) {
                potionsField.id = `${type}${newIndex}-potions`;
                const label = currentElement.querySelector(`label[for="${type}${i}-potions"]`);
                if (label) label.setAttribute('for', `${type}${newIndex}-potions`);
                
                // Mettre à jour les spans de max potions
                const maxSpan = currentElement.querySelector(`#${type}${i}-potions-max`);
                if (maxSpan) maxSpan.id = `${type}${newIndex}-potions-max`;
                const maxLabel = currentElement.querySelector(`#${type}${i}-potions-max-label`);
                if (maxLabel) maxLabel.id = `${type}${newIndex}-potions-max-label`;
            }
            
            // Mettre à jour les spans des étoiles
            const nomStar = currentElement.querySelector(`#${type}${i}-nom-star`);
            if (nomStar) nomStar.id = `${type}${newIndex}-nom-star`;
            const guerriersStar = currentElement.querySelector(`#${type}${i}-guerriers-star`);
            if (guerriersStar) guerriersStar.id = `${type}${newIndex}-guerriers-star`;
            
            // Mettre à jour le bouton retirer
            const removeBtn = currentElement.querySelector('.remove-allie-btn');
            if (removeBtn) {
                removeBtn.setAttribute('onclick', `removeAllieByElementId('${type}${newIndex}-box')`);
            }
            
            // Mettre à jour le label du nom de l'allié
            const allieLabel = currentElement.querySelector('label');
            if (allieLabel && allieLabel.textContent.includes('allié')) {
                const match = allieLabel.textContent.match(/(.*allié\s)(\d+)(.*)/);
                if (match) {
                    allieLabel.textContent = match[1] + (newIndex - 1) + match[3];
                }
            }
        }
    }
    
    // Décrémenter le compteur
    if (type === 'attaquant') {
        attaquantAlliesCount--;
    } else {
        defenseurAlliesCount--;
    }
    
    updateAllieButton(type);
    updateTitre(type);
    checkPreparatifsValidity();
}

// Fonction legacy pour compatibilité (si appelée ailleurs)
function removeAllie(type, index) {
    const elementId = `${type}${index + 3}-box`;
    removeAllieByElementId(elementId);
}

function reorganiserAllies(type) {
    const count = type === 'attaquant' ? attaquantAlliesCount : defenseurAlliesCount;
    const alliesData = [];
    
    // 1. Collecter toutes les données des alliés existants
    // On doit chercher jusqu'à un nombre assez élevé car on ne sait pas quel allié a été supprimé
    for (let i = 0; i < 10; i++) { // Chercher jusqu'à 10 alliés potentiels
        const oldId = i + 3; // Les alliés multiples commencent à 3
        const nomField = document.getElementById(`${type}${oldId}-nom`);
        const guerriersField = document.getElementById(`${type}${oldId}-guerriers`);
        const potionsField = type === 'attaquant' ? document.getElementById(`${type}${oldId}-potions`) : null;
        
        if (nomField && guerriersField) {
            alliesData.push({
                nom: nomField.value,
                guerriers: guerriersField.value,
                potions: potionsField ? potionsField.value : '0'
            });
        }
    }
    
    // 2. Supprimer tous les éléments DOM existants
    for (let i = 0; i < 10; i++) { // Nettoyer tous les éléments possibles
        const oldId = i + 3;
        const element = document.getElementById(`${type}${oldId}-box`);
        if (element) {
            element.remove();
        }
    }
    
    // 3. Filtrer et recréer tous les alliés avec les bonnes données et IDs séquentiels
    const validAlliesData = alliesData.filter(data => data && (data.nom || data.guerriers !== '0' && data.guerriers !== ''));
    
    for (let i = 0; i < validAlliesData.length; i++) {
        // Créer le nouvel élément allié
        const newElement = createAllieElement(type, i);
        const container = type === 'attaquant' 
            ? document.querySelector('.attaquant-section')
            : document.querySelector('.defenseur-section');
        
        if (container) {
            container.appendChild(newElement);
            
            // Restaurer les données
            setTimeout(() => {
                const newNomField = document.getElementById(`${type}${i + 3}-nom`);
                const newGuerriersField = document.getElementById(`${type}${i + 3}-guerriers`);
                const newPotionsField = type === 'attaquant' ? document.getElementById(`${type}${i + 3}-potions`) : null;
                
                if (newNomField) newNomField.value = validAlliesData[i].nom;
                if (newGuerriersField) newGuerriersField.value = validAlliesData[i].guerriers;
                if (newPotionsField) newPotionsField.value = validAlliesData[i].potions;
                
                // Configurer les listeners
                setupFieldListeners(type, i + 3);
                if (type === 'attaquant') {
                    setupPotionLimits(i + 3);
                }
                
                // Animer l'apparition
                setTimeout(() => {
                    newElement.style.maxHeight = newElement.scrollHeight + 'px';
                    setTimeout(() => {
                        newElement.style.maxHeight = 'none';
                    }, 300);
                }, 10);
            }, 10);
        }
    }
    
    // Mettre à jour le compteur avec le nombre réel d'alliés après réorganisation
    if (type === 'attaquant') {
        attaquantAlliesCount = validAlliesData.length;
    } else {
        defenseurAlliesCount = validAlliesData.length;
    }
}

function removeClassicAllie(type) {
    const allieBoxId = type === 'attaquant' ? 'attaquant-allie-box' : 'defenseur-allie-box';
    const allieBox = document.getElementById(allieBoxId);
    const toggleButtonId = type === 'attaquant' ? 'toggle-attaquant-allie-btn' : 'toggle-allie-btn';
    const toggleButton = document.getElementById(toggleButtonId);
    
    if (allieBox && allieBox.classList.contains('visible')) {
        // Cacher la zone d'allié et vider les champs
        allieBox.classList.remove('visible');
        
        // Réinitialiser les champs
        const nomField = document.getElementById(`${type}2-nom`);
        const guerriersField = document.getElementById(`${type}2-guerriers`);
        if (nomField) nomField.value = '';
        if (guerriersField) guerriersField.value = '';
        
        // Si attaquant, réinitialiser aussi les potions
        if (type === 'attaquant') {
            const potionsField = document.getElementById(`${type}2-potions`);
            if (potionsField) potionsField.value = '';
        }
        
        // Remettre le bouton d'ajout dans l'état initial
        if (toggleButton) {
            const emoji = type === 'attaquant' ? '⚔️' : '🛡️';
            toggleButton.textContent = `+ Ajouter un ${type} allié (optionnel)`;
        }
        
        // Recalculer les validations et mettre à jour les boutons
        updateAllieButton(type);
        updateTitre(type);
        checkPreparatifsValidity();
    }
}

function updateAllieButton(type) {
    const maxAllies = getMaxAllies(type);
    const dynamicCount = type === 'attaquant' ? attaquantAlliesCount : defenseurAlliesCount;
    const buttonId = type === 'attaquant' ? 'toggle-attaquant-allie-btn' : 'toggle-allie-btn';
    const button = document.getElementById(buttonId);
    
    if (!button) return;
    
    // Gérer la visibilité du bouton selon la configuration
    if (!isAlliesEnabled(type)) {
        // Aucun allié autorisé - cacher le bouton
        button.style.display = 'none';
        return;
    }
    
    if (isMultipleMode(type)) {
        // Mode multiple alliés
        const allieBox = type === 'attaquant' 
            ? document.getElementById('attaquant-allie-box')
            : document.getElementById('defenseur-allie-box');
        
        const classicAllieVisible = allieBox && allieBox.classList.contains('visible');
        const totalCount = dynamicCount + (classicAllieVisible ? 1 : 0);
        
        if (totalCount >= maxAllies) {
            button.style.display = 'none';
        } else {
            button.style.display = '';
            if (!classicAllieVisible) {
                button.textContent = `+ Ajouter un ${type === 'attaquant' ? 'attaquant' : 'défenseur'} allié (optionnel)`;
            } else {
                button.textContent = `+ Ajouter un ${type === 'attaquant' ? 'attaquant' : 'défenseur'} allié (${totalCount}/${maxAllies})`;
            }
        }
    } else if (isClassicMode(type)) {
        // Mode classique (1 seul allié)
        const allieBox = type === 'attaquant' 
            ? document.getElementById('attaquant-allie-box')
            : document.getElementById('defenseur-allie-box');
        
        const classicAllieVisible = allieBox && allieBox.classList.contains('visible');
        
        if (classicAllieVisible) {
            button.style.display = 'none';
        } else {
            button.style.display = '';
            button.textContent = `+ Ajouter un ${type === 'attaquant' ? 'attaquant' : 'défenseur'} allié (optionnel)`;
        }
    }
}

function setupPotionLimits(index) {
    const guerriersInput = document.getElementById(`attaquant${index}-guerriers`);
    const potionsInput = document.getElementById(`attaquant${index}-potions`);
    
    if (guerriersInput && potionsInput) {
        guerriersInput.addEventListener('input', function() {
            const g = parseInt(this.value) || 0;
            potionsInput.max = g;
            document.getElementById(`attaquant${index}-potions-max`).textContent = g;
            if (parseInt(potionsInput.value) > g) {
                potionsInput.value = g;
            }
            potionsInput.disabled = g === 0;
            if (g === 0) {
                potionsInput.value = 0;
            }
        });
    }
}

function setupFieldListeners(type, index) {
    const nomField = document.getElementById(`${type}${index}-nom`);
    const guerriersField = document.getElementById(`${type}${index}-guerriers`);
    const potionsField = type === 'attaquant' ? document.getElementById(`${type}${index}-potions`) : null;
    
    [nomField, guerriersField, potionsField].filter(Boolean).forEach(field => {
        field.addEventListener('input', checkPreparatifsValidity);
    });
}

// Fonctions utilitaires pour collecter les données des alliés
function getAllAttaquantData() {
    const data = [{
        nom: document.getElementById('attaquant-nom').value.trim(),
        guerriers: parseInt(document.getElementById('attaquant-guerriers').value) || 0,
        potions: parseInt(document.getElementById('attaquant-potions').value) || 0
    }];
    
    // Collecter l'allié classique s'il existe ET si les alliés sont activés
    if (isAlliesEnabled('attaquant')) {
        const allieBox = document.getElementById('attaquant-allie-box');
        if (allieBox && allieBox.classList.contains('visible')) {
            const nomClassique = document.getElementById('attaquant2-nom').value.trim();
            const guerriersClassique = parseInt(document.getElementById('attaquant2-guerriers').value) || 0;
            const potionsClassique = parseInt(document.getElementById('attaquant2-potions').value) || 0;
            
            if (nomClassique && guerriersClassique > 0) {
                data.push({
                    nom: nomClassique,
                    guerriers: guerriersClassique,
                    potions: potionsClassique
                });
            }
        }
        
        // Collecter les alliés multiples si le mode multiple est activé
        if (isMultipleMode('attaquant')) {
            for (let i = 0; i < attaquantAlliesCount; i++) {
                const nomField = document.getElementById(`attaquant${i + 3}-nom`); // +3 car attaquant2 est l'allié classique
                const guerriersField = document.getElementById(`attaquant${i + 3}-guerriers`);
                const potionsField = document.getElementById(`attaquant${i + 3}-potions`);
                
                if (nomField && guerriersField) {
                    const nom = nomField.value.trim();
                    const guerriers = parseInt(guerriersField.value) || 0;
                    const potions = parseInt(potionsField?.value) || 0;
                    
                    if (nom && guerriers > 0) {
                        data.push({
                            nom,
                            guerriers,
                            potions
                        });
                    }
                }
            }
        }
    }
    
    return data.filter((ally, index) => index === 0 || (ally.nom && ally.guerriers > 0));
}

function getAllDefenseurData() {
    const data = [{
        nom: document.getElementById('defenseur1-nom').value.trim(),
        guerriers: parseInt(document.getElementById('defenseur1-guerriers').value) || 0
    }];
    
    // Collecter l'allié classique s'il existe ET si les alliés sont activés
    if (isAlliesEnabled('defenseur')) {
        const allieBox = document.getElementById('defenseur-allie-box');
        if (allieBox && allieBox.classList.contains('visible')) {
            const nomClassique = document.getElementById('defenseur2-nom').value.trim();
            const guerriersClassique = parseInt(document.getElementById('defenseur2-guerriers').value) || 0;
            
            if (nomClassique && guerriersClassique > 0) {
                data.push({
                    nom: nomClassique,
                    guerriers: guerriersClassique
                });
            }
        }
        
        // Collecter les alliés multiples si le mode multiple est activé
        if (isMultipleMode('defenseur')) {
            for (let i = 0; i < defenseurAlliesCount; i++) {
                const nomField = document.getElementById(`defenseur${i + 3}-nom`); // +3 car defenseur2 est l'allié classique
                const guerriersField = document.getElementById(`defenseur${i + 3}-guerriers`);
                
                if (nomField && guerriersField) {
                    const nom = nomField.value.trim();
                    const guerriers = parseInt(guerriersField.value) || 0;
                    
                    if (nom && guerriers > 0) {
                        data.push({
                            nom,
                            guerriers
                        });
                    }
                }
            }
        }
    }
    
    return data.filter((ally, index) => index === 0 || (ally.nom && ally.guerriers > 0));
}

document.getElementById('action-desiree').addEventListener('change', function () {
    // Masquer tous les groupes de ressources
    document.getElementById('materiaux-dispo-group').style.display = 'none';
    document.getElementById('argent-dispo-group').style.display = 'none';
    
    // Afficher le bon groupe selon l'action choisie
    if (this.value === 'materiaux') {
        document.getElementById('materiaux-dispo-group').style.display = '';
    } else if (this.value === 'argent') {
        document.getElementById('argent-dispo-group').style.display = '';
    }
});

// Limite dynamique sur le champ Potions utilisées (M1) : max = Guerriers (G1)
const attaquantGuerriersInput = document.getElementById('attaquant-guerriers');
const attaquantPotionsInput = document.getElementById('attaquant-potions');
const attaquant2GuerriersInput = document.getElementById('attaquant2-guerriers');
const attaquant2PotionsInput = document.getElementById('attaquant2-potions');

function updateMaxPotions() {
    const g1 = parseInt(attaquantGuerriersInput.value) || 0;
    attaquantPotionsInput.max = g1;
    document.getElementById('attaquant-potions-max').textContent = g1;
    // Si la valeur actuelle dépasse le max, on la ramène au max
    if (parseInt(attaquantPotionsInput.value) > g1) {
        attaquantPotionsInput.value = g1;
    }
    // Désactive le champ potion si aucun guerrier n'est engagé
    attaquantPotionsInput.disabled = g1 === 0;
    if (g1 === 0) {
        attaquantPotionsInput.value = 0;
    }
}

function updateMaxPotions2() {
    const g2 = parseInt(attaquant2GuerriersInput.value) || 0;
    attaquant2PotionsInput.max = g2;
    document.getElementById('attaquant2-potions-max').textContent = g2;
    // Si la valeur actuelle dépasse le max, on la ramène au max
    if (parseInt(attaquant2PotionsInput.value) > g2) {
        attaquant2PotionsInput.value = g2;
    }
    // Désactive le champ potion si aucun guerrier n'est engagé
    attaquant2PotionsInput.disabled = g2 === 0;
    if (g2 === 0) {
        attaquant2PotionsInput.value = 0;
    }
}

attaquantGuerriersInput.addEventListener('input', updateMaxPotions);
attaquant2GuerriersInput.addEventListener('input', updateMaxPotions2);

// Appel initial pour l'état au chargement
updateMaxPotions();
updateMaxPotions2();



// Vérification supplémentaire lors de la validation
function validerEtape1() {
    const attaquantNom = document.getElementById('attaquant-nom').value.trim();
    const attaquantGuerriers = parseInt(document.getElementById('attaquant-guerriers').value) || 0;
    const attaquantPotions = parseInt(document.getElementById('attaquant-potions').value) || 0;
    const attaquant2Nom = document.getElementById('attaquant2-nom').value.trim();
    const attaquant2Guerriers = parseInt(document.getElementById('attaquant2-guerriers').value) || 0;
    const attaquant2Potions = parseInt(document.getElementById('attaquant2-potions').value) || 0;
    const defenseur1Nom = document.getElementById('defenseur1-nom').value.trim();
    const defenseur1Guerriers = parseInt(document.getElementById('defenseur1-guerriers').value) || 0;
    // Défenseur ne peut plus utiliser de potion
    // const defenseur1Potions = parseInt(document.getElementById('defenseur1-potions').value) || 0;
    const oppidumActif = document.getElementById('oppidum-actif').checked;
    const defenseur2Nom = document.getElementById('defenseur2-nom').value.trim();
    const defenseur2Guerriers = parseInt(document.getElementById('defenseur2-guerriers').value) || 0;
    const ressourcesDesirees = document.getElementById('action-desiree').value;

    let materiauxDisponibles = 0;
    let argentDisponible = 0;
    if (ressourcesDesirees === 'materiaux') {
        materiauxDisponibles = parseInt(document.getElementById('materiaux-disponibles').value) || 0;
    } else if (ressourcesDesirees === 'argent') {
        argentDisponible = parseInt(document.getElementById('argent-disponible').value) || 0;
    }

    const errorMsg = document.getElementById('error-message');
    errorMsg.classList.remove('show');

    // Validations
    if (!attaquantNom) {
        errorMsg.textContent = "⚠️ Le nom du village attaquant est requis";
        errorMsg.classList.add('show');
        return;
    }

    if (!defenseur1Nom) {
        errorMsg.textContent = "⚠️ Le nom du village défenseur est requis";
        errorMsg.classList.add('show');
        return;
    }

    if (attaquantGuerriers === 0 && attaquantPotions === 0 && attaquant2Guerriers === 0 && attaquant2Potions === 0) {
        errorMsg.textContent = "⚠️ L'attaquant doit engager au moins des guerriers ou des Guerriers sous potion";
        errorMsg.classList.add('show');
        return;
    }

    if (attaquant2Guerriers > 0 && !attaquant2Nom) {
        errorMsg.textContent = "⚠️ Si un allié attaquant envoie des guerriers, son nom doit être renseigné";
        errorMsg.classList.add('show');
        return;
    }

    if (defenseur2Guerriers > 0 && !defenseur2Nom) {
        errorMsg.textContent = "⚠️ Si un allié défenseur envoie des guerriers, son nom doit être renseigné";
        errorMsg.classList.add('show');
        return;
    }

    if (attaquantPotions > attaquantGuerriers) {
        errorMsg.textContent = "⚠️ Vous ne pouvez pas utiliser plus de potions que de guerriers engagés (attaquant principal).";
        errorMsg.classList.add('show');
        return;
    }

    if (attaquant2Potions > attaquant2Guerriers) {
        errorMsg.textContent = "⚠️ Vous ne pouvez pas utiliser plus de potions que de guerriers engagés (attaquant allié).";
        errorMsg.classList.add('show');
        return;
    }

    // Plus de vérification de potions défenseur

    // Collecter toutes les données des alliés
    const tousAttaquants = getAllAttaquantData();
    const tousDefenseurs = getAllDefenseurData();
    
    // Stocker les données (format hybride pour compatibilité)
    gameData = {
        attaquantNom: tousAttaquants[0]?.nom || '',
        attaquantGuerriers: tousAttaquants[0]?.guerriers || 0,
        attaquantPotions: tousAttaquants[0]?.potions || 0,
        attaquant2Nom: tousAttaquants[1]?.nom || '',
        attaquant2Guerriers: tousAttaquants[1]?.guerriers || 0,
        attaquant2Potions: tousAttaquants[1]?.potions || 0,
        defenseur1Nom: tousDefenseurs[0]?.nom || '',
        defenseur1Guerriers: tousDefenseurs[0]?.guerriers || 0,
        oppidumActif,
        defenseur2Nom: tousDefenseurs[1]?.nom || '',
        defenseur2Guerriers: tousDefenseurs[1]?.guerriers || 0,
        ressourcesDesirees,
        materiauxDisponibles,
        argentDisponible,
        // Ajouter les données complètes pour les nouveaux calculs
        tousAttaquants,
        tousDefenseurs
    };

    // Les préparatifs sont maintenant statiques, pas besoin de les remplir dynamiquement

    // Passer à l'étape 2
    document.getElementById('step2').classList.add('show');
    document.getElementById('step2').scrollIntoView({ behavior: 'smooth' });
}

// --- Animation de décompte et confettis ---

// Sauvegarde la fonction d'origine
const ancienneCalculerCombat = window.calculerCombat || calculerCombat;

window.calculerCombat = function () {
    // Ajoute la fondu au noir AVANT le countdown
    const fade = document.getElementById('fade-black');
    const overlay = document.getElementById('countdown-overlay');
    const number = document.getElementById('countdown-number');

    // Affiche le fondu noir
    fade.style.display = 'block';
    fade.style.opacity = '0';
    setTimeout(() => {
        fade.style.opacity = '1';
    }, 0);

    // Après la transition (0.5s), affiche la vidéo/countdown et retire le noir
    setTimeout(() => {
        fade.style.opacity = '0';
        overlay.style.display = 'flex';
        document.body.classList.add('countdown-active');
        number.textContent = '5';

        // Cache le fondu noir après la transition
        setTimeout(() => {
            fade.style.display = 'none';
        }, 300);

        let count = 5;
        let interval = setInterval(() => {
            count--;
            number.textContent = count;
            if (count <= 0) {
                clearInterval(interval);
                overlay.style.display = 'none';
                document.body.classList.remove('countdown-active');
                ancienneCalculerCombat();
                lancerConfettis();
            }
        }, 1000);
    }, 500);
};

// --- Confettis ---
function lancerConfettis() {
    const canvas = document.getElementById('confetti-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    canvas.style.opacity = '1'; // reset opacity

    const ctx = canvas.getContext('2d');
    const confettis = [];
    const colors = [
        '#FFD700', '#FF6347', '#00FF7F', '#1E90FF', '#bfa76a', '#8b6f47', '#b85450', '#fffbe6', '#fc6c85', '#d73a49', '#667eea', '#764ba2'
    ];

    const CONFETTI_COUNT = Math.floor(window.innerWidth / 4);
    for (let i = 0; i < CONFETTI_COUNT; i++) {
        confettis.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            r: 6 + Math.random() * 10,
            d: 10 + Math.random() * 18,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 20 - 10,
            tiltAngle: 0,
            tiltAngleIncremental: (Math.random() * 0.12) + 0.08,
            speed: 2 + Math.random() * 3
        });
    }

    let angle = 0;
    let frame = 0;
    const DURATION = 360; // ~6 secondes à 60fps

    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        angle += 0.02;
        for (let i = 0; i < confettis.length; i++) {
            let c = confettis[i];
            c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2 + c.speed;
            c.x += Math.sin(angle) * 2;
            c.tiltAngle += c.tiltAngleIncremental;
            c.tilt = Math.sin(c.tiltAngle) * 18;

            if (c.y > canvas.height + 20) {
                c.x = Math.random() * canvas.width;
                c.y = -20;
                c.tilt = Math.random() * 20 - 10;
            }

            ctx.beginPath();
            ctx.lineWidth = c.r;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.d);
            ctx.stroke();
        }
        frame++;
        if (frame < DURATION) {
            requestAnimationFrame(drawConfetti);
        }
        if (frame > DURATION - 75) {
            // Fade out
            canvas.style.transition = 'opacity 0.75s';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.style.display = 'none';
                canvas.style.transition = '';
                canvas.style.opacity = '1';
            }, 750);
        }
    }
    drawConfetti();
}

// Pour que le canvas suive le redimensionnement même pendant l'animation
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas.style.display !== 'none') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});



// Gestion du nouveau flux de dés indépendants
const diceResultDiv = document.getElementById('dice-roll-result');
const attaquantDeResult = document.getElementById('attaquant-de-result');
const defenseurDeResult = document.getElementById('defenseur-de-result');
const rollDiceAttaquantBtn = document.getElementById('roll-dice-attaquant');
const rollDiceDefenseurBtn = document.getElementById('roll-dice-defenseur');
const calcBtn = document.getElementById('calculate-btn');

let attaquantDe = null;
let defenseurDe = null;

function updateCalcBtnState() {
    if (typeof attaquantDe === 'number' && typeof defenseurDe === 'number') {
        calcBtn.disabled = false;
        calcBtn.style.opacity = 1;
        calcBtn.style.pointerEvents = '';
    } else {
        calcBtn.disabled = true;
        calcBtn.style.opacity = 0.6;
        calcBtn.style.pointerEvents = 'none';
    }
}

function resetDiceSection() {
    attaquantDe = null;
    defenseurDe = null;
    attaquantDeResult.textContent = '?';
    defenseurDeResult.textContent = '?';
    updateCalcBtnState();
}

function animateDiceRoll(resultSpan, callback) {
    let ticks = 0;
    // Allonge l'animation de 0.5s (environ 14 ticks de plus)
    const maxTicks = 32 + Math.floor(Math.random() * 8); // 32-39 ticks (env. 1.1-1.4s)
    const interval = 35; // ms
    let lastValue = null;
    const roll = setInterval(() => {
        let val = Math.floor(Math.random() * 10) + 1;
        // éviter de répéter le même chiffre
        if (val === lastValue) val = (val % 10) + 1;
        resultSpan.textContent = val;
        lastValue = val;
        ticks++;
        if (ticks >= maxTicks) {
            clearInterval(roll);
            setTimeout(callback, 80); // petit délai pour l'effet
        }
    }, interval);
}

// Textes d'ambiance pour les résultats de dés
const textesDe = {
    1: ["Le sanglier grillé était trop gras ce matin...", "Un mauvais présage plane sur le camp", "L'hydromel d'hier soir fait encore effet"],
    2: ["Une crampe au mauvais moment !", "Le casque glisse sur les yeux", "Une pierre dans la sandale gêne la marche"],
    3: ["L'équipement n'est pas au point", "Un moment d'hésitation fatale", "Le bouclier semble plus lourd qu'habitude"],
    4: ["Quelques erreurs de timing", "La formation se désorganise légèrement", "Un guerrier trébuche sur son épée"],
    5: ["Performance correcte mais sans éclat", "Les guerriers font leur devoir", "Une bataille comme les autres"],
    6: ["Bonne coordination générale", "Les guerriers montrent leur expérience", "Toutatis semble approuver discrètement"],
    7: ["Excellente prestation !", "Les guerriers sont en pleine forme", "L'entraînement porte ses fruits"],
    8: ["Performance remarquable !", "Inspiration divine manifeste", "Les ancêtres guident les lames"],
    9: ["Bravoure légendaire !", "Toutatis bénit ouvertement ce combat", "Les guerriers transcendent leurs limites"],
    10: ["Exploit héroïque ! Les bardes chanteront cette bataille !", "Intervention divine éclatante !", "Les dieux eux-mêmes applaudissent !"]
};

if (rollDiceAttaquantBtn) {
    rollDiceAttaquantBtn.addEventListener('click', function () {
        rollDiceAttaquantBtn.textContent = '⚡ Toutatis décide...';
        rollDiceAttaquantBtn.disabled = true;
        rollDiceAttaquantBtn.classList.add('disabled');
        
        // Ajouter animation de dé
        attaquantDeResult.parentElement.classList.add('dice-rolling');
        
        animateDiceRoll(attaquantDeResult, function () {
            attaquantDe = Math.floor(Math.random() * 10) + 1;
            attaquantDeResult.textContent = attaquantDe;
            
            // Retirer l'animation
            attaquantDeResult.parentElement.classList.remove('dice-rolling');
            
            // Afficher le texte d'ambiance
            const flavorText = textesDe[attaquantDe][Math.floor(Math.random() * textesDe[attaquantDe].length)];
            document.getElementById('attaquant-flavor-text').textContent = flavorText;
            
            rollDiceAttaquantBtn.textContent = '🎲 Destin Révélé';
            updateCalcBtnState();
        });
    });
}
if (rollDiceDefenseurBtn) {
    rollDiceDefenseurBtn.addEventListener('click', function () {
        rollDiceDefenseurBtn.textContent = '⚡ Toutatis décide...';
        rollDiceDefenseurBtn.disabled = true;
        rollDiceDefenseurBtn.classList.add('disabled');
        
        // Ajouter animation de dé
        defenseurDeResult.parentElement.classList.add('dice-rolling');
        
        animateDiceRoll(defenseurDeResult, function () {
            defenseurDe = Math.floor(Math.random() * 10) + 1;
            defenseurDeResult.textContent = defenseurDe;
            
            // Retirer l'animation
            defenseurDeResult.parentElement.classList.remove('dice-rolling');
            
            // Afficher le texte d'ambiance
            const flavorText = textesDe[defenseurDe][Math.floor(Math.random() * textesDe[defenseurDe].length)];
            document.getElementById('defenseur-flavor-text').textContent = flavorText;
            
            rollDiceDefenseurBtn.textContent = '🎲 Destin Révélé';
            updateCalcBtnState();
        });
    });
}

// Réinitialise le bouton lors d'un nouveau combat
function resetCalcBtn() {
    resetDiceSection();
}
document.querySelector('.reset-btn').addEventListener('click', resetCalcBtn);



function calculerCombat() {
    // Utilise les valeurs de dés stockées
    if (typeof attaquantDe !== 'number' || typeof defenseurDe !== 'number') return;

    const errorMsg = document.getElementById('error-message-dice');
    errorMsg.classList.remove('show');

    // Validations
    if (attaquantDe < 1 || attaquantDe > 10) {
        errorMsg.textContent = "⚠️ Le jet de dé de l'attaquant doit être entre 1 et 10";
        errorMsg.classList.add('show');
        return;
    }

    if (defenseurDe < 1 || defenseurDe > 10) {
        errorMsg.textContent = "⚠️ Le jet de dé du défenseur doit être entre 1 et 10";
        errorMsg.classList.add('show');
        return;
    }

    const {
        oppidumActif,
        ressourcesDesirees,
        materiauxDisponibles,
        argentDisponible,
        tousAttaquants,
        tousDefenseurs
    } = gameData;

    // Utiliser les nouvelles données complètes
    const attaquants = tousAttaquants || [];
    const defenseurs = tousDefenseurs || [];
    
    // Variables de compatibilité pour l'ancien code
    const attaquantNom = attaquants[0]?.nom || '';
    const attaquantGuerriers = attaquants[0]?.guerriers || 0;
    const attaquantPotions = attaquants[0]?.potions || 0;
    const attaquant2Nom = attaquants[1]?.nom || '';
    const attaquant2Guerriers = attaquants[1]?.guerriers || 0;
    const attaquant2Potions = attaquants[1]?.potions || 0;
    const defenseur1Nom = defenseurs[0]?.nom || '';
    const defenseur1Guerriers = defenseurs[0]?.guerriers || 0;
    const defenseur2Nom = defenseurs[1]?.nom || '';
    const defenseur2Guerriers = defenseurs[1]?.guerriers || 0;

    const aAllieAttaquant = attaquants.length > 1;
    const aAllieDefenseur = defenseurs.length > 1;

    // Calculs de combat avec tous les alliés
    // Calculer totaux attaquants (avec potions)
    const totalAttaquantGuerriers = attaquants.reduce((sum, att) => sum + att.guerriers, 0);
    const totalAttaquantPotions = attaquants.reduce((sum, att) => sum + att.potions, 0);
    
    // Calculer totaux défenseurs (avec bonus oppidum)
    const totalDefenseurGuerriers = defenseurs.reduce((sum, def) => sum + def.guerriers, 0);
    let bonusOppidum = 0;
    if (oppidumActif) {
        bonusOppidum = totalDefenseurGuerriers * 0.5; // 50% de bonus sur TOUS les défenseurs
    }

    // Calcul final du combat
    const A = totalAttaquantGuerriers + attaquantDe + (totalAttaquantPotions * 0.5);
    const D = totalDefenseurGuerriers + bonusOppidum + defenseurDe;
    const R = A - D;

    // Calcul des ressources volées (inchangé)
    let V = 0;
    let ressourcesVoleesReelles = 0; // Valeur numérique réelle volée
    let ressourcesVolees = '';
    if (R > 0) {
        V = Math.ceil(R / 2);

        if (ressourcesDesirees === 'materiaux') {
            const X = materiauxDisponibles - V;
            if (X >= 0) {
                ressourcesVoleesReelles = V;
                ressourcesVolees = `${V} matériau(x)`;
            } else {
                ressourcesVoleesReelles = materiauxDisponibles;
                ressourcesVolees = `${materiauxDisponibles} matériau(x) (stocks épuisés)`;
            }
        } else if (ressourcesDesirees === 'argent') {
            const X = argentDisponible - V;
            if (X >= 0) {
                ressourcesVoleesReelles = V;
                ressourcesVolees = `${V} pièce(s) d'argent`;
            } else {
                ressourcesVoleesReelles = argentDisponible;
                ressourcesVolees = `${argentDisponible} pièce(s) d'argent (stocks épuisés)`;
            }
        }
    } else {
        ressourcesVolees = 'Aucune';
    }

    /**
     * Nouveau système de pertes réalistes basé sur la taille totale des armées
     * @param {number} guerriers - Guerriers engagés pour ce camp
     * @param {number} de - Jet de dé de ce camp
     * @param {number} guerriersAdverse - Guerriers engagés pour l'adversaire
     * @param {number} deAdverse - Jet de dé de l'adversaire
     * @param {boolean} victoire - true si ce camp a gagné, false sinon
     * @param {boolean} estAttaquant - true si ce camp attaque, false si défend
     * @param {number} tailleTotale - Taille totale des deux armées combinées
     * @returns {{ pertes: number, pourcentage: number }}
     */
    function calculerPertesAvancees(guerriers, de, guerriersAdverse, deAdverse, victoire, estAttaquant, tailleTotale) {
        if (guerriers === 0) return { pertes: 0, pourcentage: 0 };

        // 1. Facteur d'intensité basé sur la taille totale du combat
        let facteurIntensite;
        if (tailleTotale <= 30) facteurIntensite = 0.8;      // Petite escarmouche
        else if (tailleTotale <= 80) facteurIntensite = 1.0; // Bataille moyenne  
        else if (tailleTotale <= 150) facteurIntensite = 1.2; // Grande bataille
        else facteurIntensite = 1.5;                          // Guerre massive

        // 2. Pertes de base selon l'issue du combat
        let pourcentageBase;
        if (victoire) {
            // Vainqueur : pertes plus faibles mais significatives
            if (tailleTotale <= 30) pourcentageBase = 12;
            else if (tailleTotale <= 80) pourcentageBase = 15;
            else if (tailleTotale <= 150) pourcentageBase = 20;
            else pourcentageBase = 25;
        } else {
            // Perdant : pertes lourdes
            if (tailleTotale <= 30) pourcentageBase = 20;
            else if (tailleTotale <= 80) pourcentageBase = 28;
            else if (tailleTotale <= 150) pourcentageBase = 35;
            else pourcentageBase = 45;
        }

        // 3. Modificateur attaquant/défenseur
        if (estAttaquant) {
            pourcentageBase += 3; // Malus attaquant (assaut difficile)
        } else {
            pourcentageBase = Math.max(1, pourcentageBase - 2); // Bonus défenseur (avantage terrain)
        }

        // 4. Modificateur de férocité basé sur les dés
        const ecartDes = Math.abs(de - deAdverse);
        let modificateurFerocite = 0;
        
        // La férocité s'applique selon qui a le meilleur dé
        const meilleurDe = de > deAdverse;
        if (ecartDes >= 3 && ecartDes <= 4) modificateurFerocite = 5;
        else if (ecartDes >= 5 && ecartDes <= 6) modificateurFerocite = 8;
        else if (ecartDes >= 7) modificateurFerocite = 12;

        // Si ce camp a le meilleur dé, il inflige plus de dégâts à l'adversaire
        // Donc ses propres pertes diminuent légèrement
        if (meilleurDe && modificateurFerocite > 0) {
            pourcentageBase = Math.max(5, pourcentageBase - Math.floor(modificateurFerocite / 2));
        }
        // Si ce camp a le moins bon dé, l'adversaire lui inflige plus de dégâts
        else if (!meilleurDe && modificateurFerocite > 0) {
            pourcentageBase += modificateurFerocite;
        }

        // 5. Application du facteur d'intensité
        const pourcentageFinal = Math.max(5, Math.min(60, pourcentageBase * facteurIntensite));
        
        return {
            pertes: Math.ceil(guerriers * (pourcentageFinal / 100)),
            pourcentage: Math.round(pourcentageFinal * 10) / 10
        };
    }

    // Calcul des pertes brutes avec le nouveau système pour TOUS les alliés
    const tailleTotaleCombat = totalAttaquantGuerriers + totalDefenseurGuerriers;
    
    // Fonction pour l'oppidum
    function oppidumSauve(pertes, oppidumActif) {
        if (!oppidumActif || pertes === 0) return pertes;
        let sauves = 0;
        for (let i = 0; i < pertes; i++) {
            if (Math.random() < 0.5) sauves++;
        }
        return pertes - sauves;
    }
    
    // Calculer les pertes pour tous les attaquants
    const pertesAttaquantsData = attaquants.map(attaquant => {
        if (attaquant.guerriers === 0) return { pertes: 0, pourcentage: 0, pertesFinales: 0 };
        
        const pertesbrut = calculerPertesAvancees(
            attaquant.guerriers,
            attaquantDe,
            totalDefenseurGuerriers,
            defenseurDe,
            R > 0,
            true,
            tailleTotaleCombat
        );
        
        // Protection par potions
        const pertesFinales = Math.max(0, pertesbrut.pertes - attaquant.potions);
        
        return {
            ...pertesbrut,
            pertesFinales,
            potionsUtilisees: Math.min(attaquant.potions, pertesbrut.pertes)
        };
    });
    
    // Calculer les pertes pour tous les défenseurs
    const pertesDefenseursData = defenseurs.map(defenseur => {
        if (defenseur.guerriers === 0) return { pertes: 0, pourcentage: 0, pertesFinales: 0, sauves: 0 };
        
        const pertesbrut = calculerPertesAvancees(
            defenseur.guerriers,
            defenseurDe,
            totalAttaquantGuerriers,
            attaquantDe,
            R <= 0,
            false,
            tailleTotaleCombat
        );
        
        // Protection par oppidum
        const pertesFinales = oppidumSauve(pertesbrut.pertes, oppidumActif);
        const sauves = oppidumActif ? (pertesbrut.pertes - pertesFinales) : 0;
        
        return {
            ...pertesbrut,
            pertesFinales,
            sauves
        };
    });

    // Variables de compatibilité pour l'ancien affichage
    const pertesAttaquant = pertesAttaquantsData[0]?.pertesFinales || 0;
    const pertesAttaquant2 = pertesAttaquantsData[1]?.pertesFinales || 0;
    const pertesDefenseur1 = pertesDefenseursData[0]?.pertesFinales || 0;
    const pertesDefenseur2 = pertesDefenseursData[1]?.pertesFinales || 0;
    const pertesDefenseur1Sauvées = pertesDefenseursData[0]?.sauves || 0;
    const pertesDefenseur2Sauvées = pertesDefenseursData[1]?.sauves || 0;

    const vainqueur = R > 0 ? attaquantNom : defenseur1Nom;
    const vainqueurClass = R > 0 ? 'attaquant' : 'defenseur';

    // Affichage du total théorique de ressources à capter
    let theoriqueVole = '';
    if (R > 0) {
        theoriqueVole = `<div style="font-size:1em; color:#888; margin-bottom:8px;">
        Total théorique à piller : <strong>${V}</strong> ressources
    </div>`;
    }

    // Calcul de l'intensité du combat pour l'affichage
    let intensiteTexte = '';
    if (tailleTotaleCombat <= 30) intensiteTexte = 'Escarmouche';
    else if (tailleTotaleCombat <= 80) intensiteTexte = 'Bataille';
    else if (tailleTotaleCombat <= 150) intensiteTexte = 'Grande bataille';
    else intensiteTexte = 'Guerre massive';

    const ecartDes = Math.abs(attaquantDe - defenseurDe);
    let ferociteTexte = '';
    if (ecartDes >= 7) ferociteTexte = 'Combat acharné';
    else if (ecartDes >= 5) ferociteTexte = 'Combat intense';
    else if (ecartDes >= 3) ferociteTexte = 'Combat équilibré';
    else ferociteTexte = 'Combat modéré';

    let html = `
                <div class="winner-banner ${vainqueurClass}">
                    🏆 Victoire ${vainqueurClass === 'attaquant' ? "de l'attaquant" : "du défenseur"} ${vainqueur} !
                </div>

                <div class="battle-summary">
                    <div class="summary-row">
                        <div class="summary-box attaquant-summary">
                            <h3>🤺 Camp Attaquant</h3>
                            <div class="summary-stats">
                                <div class="stat-line"><span class="stat-label">Total guerriers :</span> <span class="stat-value">${totalAttaquantGuerriers}</span></div>
                                <div class="stat-line"><span class="stat-label">Potions utilisées :</span> <span class="stat-value">${totalAttaquantPotions}</span></div>
                                <div class="stat-line"><span class="stat-label">Jet de dé :</span> <span class="stat-value">${attaquantDe}</span></div>
                                <div class="stat-line"><span class="stat-label">Force totale :</span> <span class="stat-value">${A}</span></div>
                            </div>
                            <button class="toggle-details" onclick="toggleAttaquantDetails()" style="margin-top:8px; padding:4px 12px; font-size:0.9em; background:#8b6f47; color:white; border:none; border-radius:4px; cursor:pointer;">
                                📊 Voir détails
                            </button>
                            <div id="attaquant-details" class="combat-details" style="display:none; margin-top:8px; padding:8px; background:rgba(139,111,71,0.1); border-radius:4px; font-size:0.9em;">
                                ${attaquants.map(att => `<div class="detail-line">• ${att.nom} : ${att.guerriers} guerriers + ${att.potions} potions</div>`).join('')}
                                <div class="detail-line">• Bonus potions : +${(totalAttaquantPotions * 0.5).toFixed(1)}</div>
                                <div class="detail-line">• Malus assaut : +3% pertes</div>
                                <div class="detail-line"><strong>Calcul : ${totalAttaquantGuerriers} + ${attaquantDe} + ${(totalAttaquantPotions * 0.5).toFixed(1)} = ${A}</strong></div>
                            </div>
                        </div>

                        <div class="summary-box defenseur-summary">
                            <h3>🛡️ Camp Défenseur</h3>
                            <div class="summary-stats">
                                <div class="stat-line"><span class="stat-label">Total guerriers :</span> <span class="stat-value">${totalDefenseurGuerriers}</span></div>
                                <div class="stat-line"><span class="stat-label">Bonus oppidum :</span> <span class="stat-value">${oppidumActif ? '+' + bonusOppidum.toFixed(1) : 'Aucun'}</span></div>
                                <div class="stat-line"><span class="stat-label">Jet de dé :</span> <span class="stat-value">${defenseurDe}</span></div>
                                <div class="stat-line"><span class="stat-label">Force totale :</span> <span class="stat-value">${D}</span></div>
                            </div>
                            <button class="toggle-details" onclick="toggleDefenseurDetails()" style="margin-top:8px; padding:4px 12px; font-size:0.9em; background:#8b6f47; color:white; border:none; border-radius:4px; cursor:pointer;">
                                � Voir détails  
                            </button>
                            <div id="defenseur-details" class="combat-details" style="display:none; margin-top:8px; padding:8px; background:rgba(139,111,71,0.1); border-radius:4px; font-size:0.9em;">
                                ${defenseurs.map(def => `<div class="detail-line">• ${def.nom} : ${def.guerriers} guerriers</div>`).join('')}
                                ${oppidumActif ? `<div class="detail-line">• Bonus oppidum : +${bonusOppidum.toFixed(1)} (50% des effectifs)</div>` : ''}
                                <div class="detail-line">• Bonus terrain : -2% pertes</div>
                                <div class="detail-line"><strong>Calcul : ${totalDefenseurGuerriers} ${oppidumActif ? '+ ' + bonusOppidum.toFixed(1) : ''} + ${defenseurDe} = ${D}</strong></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="battle-context" style="text-align:center; margin:16px 0; padding:12px; background:rgba(191,167,106,0.1); border-radius:8px;">
                        <div style="font-size:1.1em; font-weight:500; color:#bfa76a; margin-bottom:4px;">
                            ${intensiteTexte} • ${ferociteTexte}
                        </div>
                        <div style="font-size:0.9em; color:#888;">
                            ${tailleTotaleCombat} guerriers au total • Écart de dés: ${ecartDes}
                        </div>
                    </div>
                </div>

                ${theoriqueVole}
                <div class="results-grid">
                    <div class="result-box">
                        <div class="result-label">Ressources pillées</div>
                        <div class="result-value" style="font-size: 1.5em;">${ressourcesVolees}</div>
                    </div>

                    ${pertesAttaquantsData.map((pertesData, i) => `
                    <div class="result-box">
                        <div class="result-label">Pertes ${attaquants[i].nom}</div>
                        <div class="result-value">${pertesData.pertesFinales} guerriers</div>
                        <div class="result-detail" style="font-size:0.95em; color:#888;">(${pertesData.pertes} pertes brutes − ${pertesData.potionsUtilisees || 0} potions)</div>
                    </div>
                    `).join('')}

                    ${pertesDefenseursData.map((pertesData, i) => `
                    <div class="result-box">
                        <div class="result-label">Pertes ${defenseurs[i].nom}</div>
                        <div class="result-value">${pertesData.pertesFinales} guerriers</div>
                        <div class="result-detail" style="font-size:0.95em; color:#888;">
                            (${pertesData.pertes} pertes brutes${oppidumActif && pertesData.sauves > 0 ? `, ${pertesData.sauves} sauvés par les remparts` : ''})
                        </div>
                    </div>
                    `).join('')}
                </div>
            `;

    // Stocker les résultats du combat pour le bilan maître de salle
    gameData.resultats = {
        A, D, R,
        ressourcesVolees: ressourcesVoleesReelles,
        // Données de compatibilité
        pertesAttaquant,
        pertesAttaquant2,
        pertesDefenseur1,
        pertesDefenseur2,
        aAllieAttaquant,
        aAllieDefenseur,
        attaquantDe,
        defenseurDe,
        // Nouvelles données complètes
        attaquants,
        defenseurs,
        pertesAttaquantsData,
        pertesDefenseursData,
        totalAttaquantGuerriers,
        totalDefenseurGuerriers,
        totalAttaquantPotions
    };

    document.getElementById('results-content').innerHTML = html;
    document.getElementById('results').classList.add('show');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Fonctions pour les toggles de détails
function toggleAttaquantDetails() {
    const details = document.getElementById('attaquant-details');
    const button = document.querySelector('.attaquant-summary .toggle-details');
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.textContent = '📊 Masquer détails';
    } else {
        details.style.display = 'none';
        button.textContent = '📊 Voir détails';
    }
}

function toggleDefenseurDetails() {
    const details = document.getElementById('defenseur-details');
    const button = document.querySelector('.defenseur-summary .toggle-details');
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.textContent = '📊 Masquer détails';
    } else {
        details.style.display = 'none';
        button.textContent = '📊 Voir détails';
    }
}

function recommencer() {
    // // Réinitialiser tous les champs
    // document.getElementById('attaquant-nom').value = '';
    // document.getElementById('attaquant-guerriers').value = '0';
    // document.getElementById('attaquant-potions').value = '0';
    // document.getElementById('defenseur1-nom').value = '';
    // document.getElementById('defenseur1-guerriers').value = '0';
    // document.getElementById('defenseur1-potions').value = '0';
    // document.getElementById('oppidum-actif').checked = false;
    // document.getElementById('defenseur2-nom').value = '';
    // document.getElementById('defenseur2-guerriers').value = '0';
    // document.getElementById('potions-disponibles').value = '0';
    // document.getElementById('materiaux-disponibles').value = '0';
    // document.getElementById('attaquant-de').value = '';
    // document.getElementById('defenseur-de').value = '';

    // // Masquer les sections
    // document.getElementById('step2').classList.remove('show');
    // document.getElementById('results').classList.remove('show');

    // // Remonter en haut
    // document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });

    // // Réinitialiser les données
    // gameData = {};

        window.location.reload();
}

// Affichage/fermeture de la modale
const helpBtn = document.getElementById('help-btn');
const modal = document.getElementById('rules-modal');
const closeModal = document.getElementById('close-modal');

// Flèche si scroll possible dans la modale
function updateScrollArrow() {
    const scroll = document.getElementById('modal-scroll');
    const arrow = document.getElementById('scroll-arrow');
    if (!scroll || !arrow) return;
    // Affiche la flèche si le contenu déborde
    if (scroll.scrollHeight > scroll.clientHeight + 4) {
        // Si on n'est pas tout en bas, affiche la flèche
        if (scroll.scrollTop + scroll.clientHeight < scroll.scrollHeight - 4) {
            arrow.style.display = '';
        } else {
            arrow.style.display = 'none';
        }
    } else {
        arrow.style.display = 'none';
    }
}
const modalScroll = document.getElementById('modal-scroll');
if (modalScroll) {
    modalScroll.addEventListener('scroll', updateScrollArrow);
}
helpBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.focus();
    setTimeout(updateScrollArrow, 100); // attendre le rendu
});
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
});
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex' && (e.key === 'Escape' || e.key === 'Esc')) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
});
window.addEventListener('resize', updateScrollArrow);

// Fonction pour mettre à jour le titre Défenseur(s)
function updateDefenseurTitre() {
    if (!isAlliesEnabled('defenseur')) return;
    
    updateTitre('defenseur');
}

// Fonction pour mettre à jour le titre Attaquant(s)
function updateAttaquantTitre() {
    if (!isAlliesEnabled('attaquant')) return;
    
    updateTitre('attaquant');
}

function updateTitre(type) {
    const section = document.querySelector(`.${type}-section`);
    if (!section) return;
    
    const titre = section.querySelector('.section-title');
    if (!titre) return;
    
    if (isMultipleMode(type)) {
        const dynamicCount = type === 'attaquant' ? attaquantAlliesCount : defenseurAlliesCount;
        const allieBox = type === 'attaquant' 
            ? document.getElementById('attaquant-allie-box')
            : document.getElementById('defenseur-allie-box');
        
        const classicAllieVisible = allieBox && allieBox.classList.contains('visible');
        const totalCount = dynamicCount + (classicAllieVisible ? 1 : 0);
        
        const emoji = type === 'attaquant' ? '🤺' : '🛡️';
        const label = type === 'attaquant' ? 'Attaquant' : 'Défenseur';
        
        if (totalCount > 0) {
            titre.textContent = `${label}s ${emoji} (${totalCount + 1})`;
        } else {
            titre.textContent = `${label} ${emoji}`;
        }
    } else {
        // Comportement classique
        const allieBox = type === 'attaquant' 
            ? document.getElementById('attaquant-allie-box')
            : document.getElementById('defenseur-allie-box');
            
        if (allieBox && allieBox.classList.contains('visible')) {
            titre.textContent = type === 'attaquant' ? "Attaquants 🤺" : "Défenseurs 🛡️";
        } else {
            titre.textContent = type === 'attaquant' ? "Attaquant(s) 🤺" : "Défenseur 🛡️";
        }
    }
}

// Ajoute la gestion de l'obligation des champs allié
function updateAllieRequired() {
    if (!isAlliesEnabled('defenseur')) return;
    
    const allieBox = document.getElementById('defenseur-allie-box');
    const nomStar = document.getElementById('defenseur2-nom-star');
    const guerriersStar = document.getElementById('defenseur2-guerriers-star');
    const nomInput = document.getElementById('defenseur2-nom');
    const guerriersInput = document.getElementById('defenseur2-guerriers');
    const isVisible = allieBox.classList.contains('visible');

    // Affiche ou masque l'étoile obligatoire
    nomStar.style.display = isVisible ? '' : 'none';
    guerriersStar.style.display = isVisible ? '' : 'none';

    // Ajoute ou retire l'attribut required
    if (isVisible) {
        nomInput.setAttribute('required', 'required');
        guerriersInput.setAttribute('required', 'required');
    } else {
        nomInput.removeAttribute('required');
        guerriersInput.removeAttribute('required');
    }
}

// Ajoute la gestion de l'obligation des champs attaquant allié
function updateAttaquantAllieRequired() {
    if (!isAlliesEnabled('attaquant')) return;
    
    const allieBox = document.getElementById('attaquant-allie-box');
    const nomStar = document.getElementById('attaquant2-nom-star');
    const guerriersStar = document.getElementById('attaquant2-guerriers-star');
    const nomInput = document.getElementById('attaquant2-nom');
    const guerriersInput = document.getElementById('attaquant2-guerriers');
    const isVisible = allieBox.classList.contains('visible');

    // Affiche ou masque l'étoile obligatoire
    nomStar.style.display = isVisible ? '' : 'none';
    guerriersStar.style.display = isVisible ? '' : 'none';

    // Ajoute ou retire l'attribut required
    if (isVisible) {
        nomInput.setAttribute('required', 'required');
        guerriersInput.setAttribute('required', 'required');
    } else {
        nomInput.removeAttribute('required');
        guerriersInput.removeAttribute('required');
    }
}

// Mets à jour la validation pour rendre les champs allié obligatoires si visible
function checkPreparatifsValidity() {
    const attaquantNom = document.getElementById('attaquant-nom').value.trim();
    const attaquantGuerriers = parseInt(document.getElementById('attaquant-guerriers').value) || 0;
    const defenseur1Nom = document.getElementById('defenseur1-nom').value.trim();
    const defenseur1Guerriers = parseInt(document.getElementById('defenseur1-guerriers').value) || 0;
    const actionDesiree = document.getElementById('action-desiree').value;
    let ressourcesOk = false;
    if (actionDesiree === 'argent') {
        ressourcesOk = (document.getElementById('argent-disponible').value !== '');
    } else {
        ressourcesOk = (document.getElementById('materiaux-disponibles').value !== '');
    }

    // Il faut au moins un guerrier attaquant OU une potion utilisée
    const attaquantPotions = parseInt(document.getElementById('attaquant-potions').value) || 0;
    const attaquantOk = attaquantNom && (attaquantGuerriers > 0 || attaquantPotions > 0);

    const defenseurOk = defenseur1Nom && defenseur1Guerriers >= 0;

    // Validation des alliés (simple ou multiple)
    let allieDefOk = true;
    let allieAttOk = true;

    // Validation des alliés - Compatible avec les deux modes
    
    // Défenseurs alliés
    if (isAlliesEnabled('defenseur')) {
        if (isMultipleMode('defenseur')) {
            // D'abord vérifier l'allié classique
            const allieDefBox = document.getElementById('defenseur-allie-box');
            const allieDefVisible = allieDefBox && allieDefBox.classList.contains('visible');
            if (allieDefVisible) {
                const defenseur2Nom = document.getElementById('defenseur2-nom')?.value.trim();
                const defenseur2Guerriers = document.getElementById('defenseur2-guerriers')?.value;
                if (!defenseur2Nom || defenseur2Nom.length === 0 || defenseur2Guerriers === '') {
                    allieDefOk = false;
                }
            }
            
            // Puis vérifier tous les alliés multiples défenseurs (commencent à index 3)
            if (allieDefOk) {
                for (let i = 0; i < defenseurAlliesCount; i++) {
                    const nomField = document.getElementById(`defenseur${i + 3}-nom`);
                    const guerriersField = document.getElementById(`defenseur${i + 3}-guerriers`);
                    console.log(`Checking defenseur${i + 3}:`, {
                        nomField: nomField ? nomField.value : 'not found',
                        guerriersField: guerriersField ? guerriersField.value : 'not found'
                    });
                    if (nomField && guerriersField) {
                        if (!nomField.value.trim() || guerriersField.value === '') {
                            console.log(`Validation failed for defenseur${i + 3}`);
                            allieDefOk = false;
                            break;
                        }
                    }
                }
            }
        } else {
            // Comportement classique pour un seul allié défenseur
            const allieDefBox = document.getElementById('defenseur-allie-box');
            const allieDefVisible = allieDefBox && allieDefBox.classList.contains('visible');
            const defenseur2Nom = document.getElementById('defenseur2-nom')?.value.trim();
            const defenseur2Guerriers = document.getElementById('defenseur2-guerriers')?.value;
            if (allieDefVisible) {
                allieDefOk = defenseur2Nom && defenseur2Nom.length > 0 && defenseur2Guerriers !== '';
            }
        }
    }

    // Attaquants alliés
    if (isAlliesEnabled('attaquant')) {
        if (isMultipleMode('attaquant')) {
            // D'abord vérifier l'allié classique
            const allieAttBox = document.getElementById('attaquant-allie-box');
            const allieAttVisible = allieAttBox && allieAttBox.classList.contains('visible');
            if (allieAttVisible) {
                const attaquant2Nom = document.getElementById('attaquant2-nom')?.value.trim();
                const attaquant2Guerriers = document.getElementById('attaquant2-guerriers')?.value;
                if (!attaquant2Nom || attaquant2Nom.length === 0 || attaquant2Guerriers === '') {
                    allieAttOk = false;
                }
            }
            
            // Puis vérifier tous les alliés multiples attaquants (commencent à index 3)
            if (allieAttOk) {
                for (let i = 0; i < attaquantAlliesCount; i++) {
                    const nomField = document.getElementById(`attaquant${i + 3}-nom`);
                    const guerriersField = document.getElementById(`attaquant${i + 3}-guerriers`);
                    console.log(`Checking attaquant${i + 3}:`, {
                        nomField: nomField ? nomField.value : 'not found',
                        guerriersField: guerriersField ? guerriersField.value : 'not found'
                    });
                    if (nomField && guerriersField) {
                        if (!nomField.value.trim() || guerriersField.value === '') {
                            console.log(`Validation failed for attaquant${i + 3}`);
                            allieAttOk = false;
                            break;
                        }
                    }
                }
            }
        } else {
            // Comportement classique pour un seul allié attaquant
            const allieAttBox = document.getElementById('attaquant-allie-box');
            const allieAttVisible = allieAttBox && allieAttBox.classList.contains('visible');
            const attaquant2Nom = document.getElementById('attaquant2-nom')?.value.trim();
            const attaquant2Guerriers = document.getElementById('attaquant2-guerriers')?.value;
            if (allieAttVisible) {
                allieAttOk = attaquant2Nom && attaquant2Nom.length > 0 && attaquant2Guerriers !== '';
            }
        }
    }

    // Debug: afficher l'état de validation dans la console
    console.log('Validation state:', {
        attaquantOk,
        defenseurOk,
        actionDesiree,
        ressourcesOk,
        allieDefOk,
        allieAttOk,
        defenseurAlliesCount,
        attaquantAlliesCount
    });

    // Ressource obligatoire selon l'action désirée
    const btn = document.getElementById('valider-preparatifs-btn');
    if (attaquantOk && defenseurOk && actionDesiree && ressourcesOk && allieDefOk && allieAttOk) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

// Ajoute les écouteurs sur tous les champs obligatoires + allié
[
    'attaquant-nom', 'attaquant-guerriers', 'attaquant-potions',
    'attaquant2-nom', 'attaquant2-guerriers', 'attaquant2-potions',
    'defenseur1-nom', 'defenseur1-guerriers',
    'action-desiree', 'materiaux-disponibles', 'argent-disponible',
    'defenseur2-nom', 'defenseur2-guerriers'
].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', checkPreparatifsValidity);
    }
});

// Mets à jour l'obligation visuelle/mécanique à chaque ouverture/fermeture de l'allié
window.addEventListener('DOMContentLoaded', function () {
    // Masquer le bouton d'allié attaquant si la fonctionnalité est désactivée
    if (!isAlliesEnabled('attaquant')) {
        const toggleAttaquantAllieBtn = document.getElementById('toggle-attaquant-allie-btn');
        if (toggleAttaquantAllieBtn) {
            toggleAttaquantAllieBtn.style.display = 'none';
        }
    }
    
    // Masquer le bouton d'allié défenseur si la fonctionnalité est désactivée
    if (!isAlliesEnabled('defenseur')) {
        const toggleAllieBtn = document.getElementById('toggle-allie-btn');
        if (toggleAllieBtn) {
            toggleAllieBtn.style.display = 'none';
        }
    }
    
    // Initialiser les boutons pour le mode alliés multiples
    if (isMultipleMode('attaquant') || isMultipleMode('defenseur')) {
        updateAllieButton('attaquant');
        updateAllieButton('defenseur');
    }

    const toggleAllieBtn = document.getElementById('toggle-allie-btn');
    if (toggleAllieBtn && isAlliesEnabled('defenseur')) {
        toggleAllieBtn.addEventListener('click', function () {
            if (isMultipleMode('defenseur')) {
                addAllie('defenseur');
            } else {
                // Comportement classique pour un seul allié
                const box = document.getElementById('defenseur-allie-box');
                const isVisible = box.classList.contains('visible');
                if (!isVisible) {
                    box.style.maxHeight = box.scrollHeight + "px";
                    box.classList.add('visible');
                    this.textContent = '− Retirer le défenseur allié';
                } else {
                    box.style.maxHeight = box.scrollHeight + "px";
                    void box.offsetHeight;
                    box.style.maxHeight = "0";
                    box.classList.remove('visible');
                    this.textContent = '+ Ajouter un défenseur allié (optionnel)';
                    document.getElementById('defenseur2-nom').value = '';
                    document.getElementById('defenseur2-guerriers').value = '';
                }
                updateDefenseurTitre();
                updateAllieRequired();
                checkPreparatifsValidity();
            }
        });
    }

    const toggleAttaquantAllieBtn = document.getElementById('toggle-attaquant-allie-btn');
    if (toggleAttaquantAllieBtn && isAlliesEnabled('attaquant')) {
        toggleAttaquantAllieBtn.addEventListener('click', function () {
            if (isMultipleMode('attaquant')) {
                addAllie('attaquant');
            } else {
                // Comportement classique pour un seul allié
                const box = document.getElementById('attaquant-allie-box');
                const isVisible = box.classList.contains('visible');
                if (!isVisible) {
                    box.style.maxHeight = box.scrollHeight + "px";
                    box.classList.add('visible');
                    this.textContent = '− Retirer l\'attaquant allié';
                } else {
                    box.style.maxHeight = box.scrollHeight + "px";
                    void box.offsetHeight;
                    box.style.maxHeight = "0";
                    box.classList.remove('visible');
                    this.textContent = '+ Ajouter un attaquant allié (optionnel)';
                    document.getElementById('attaquant2-nom').value = '';
                    document.getElementById('attaquant2-guerriers').value = '';
                    document.getElementById('attaquant2-potions').value = '0';
                }
                updateAttaquantTitre();
                updateAttaquantAllieRequired();
                checkPreparatifsValidity();
            }
        });
    }
    // Appel initial pour le bon affichage au chargement
    updateDefenseurTitre();
    updateAttaquantTitre();
    updateAllieRequired();
    updateAttaquantAllieRequired();
    checkPreparatifsValidity();
});

// Mets aussi à jour à chaque transition (ex: animation CSS)
const defenseurAllieBox = document.getElementById('defenseur-allie-box');
if (defenseurAllieBox && isAlliesEnabled('defenseur')) {
    defenseurAllieBox.addEventListener('transitionend', function (e) {
        if (this.classList.contains('visible')) {
            this.style.maxHeight = 'none';
        }
        updateAllieRequired();
        checkPreparatifsValidity();
    });
}

const attaquantAllieBox = document.getElementById('attaquant-allie-box');
if (attaquantAllieBox && isAlliesEnabled('attaquant')) {
    attaquantAllieBox.addEventListener('transitionend', function (e) {
        if (this.classList.contains('visible')) {
            this.style.maxHeight = 'none';
        }
        updateAttaquantAllieRequired();
        checkPreparatifsValidity();
    });
}

// --- Masquer étapes si modification en haut ou dans les dés ---

// Tous les champs de l'étape 1
const step1Inputs = [
    'attaquant-nom', 'attaquant-guerriers', 'attaquant-potions',
    'attaquant2-nom', 'attaquant2-guerriers', 'attaquant2-potions',
    'defenseur1-nom', 'defenseur1-guerriers', 'defenseur1-potions',
    'oppidum-actif', 'defenseur2-nom', 'defenseur2-guerriers',
    'action-desiree', 'materiaux-disponibles'
];
step1Inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', () => {
            document.getElementById('step2').classList.remove('show');
            document.getElementById('results').classList.remove('show');
        });
        // Pour le checkbox oppidum
        if (el.type === 'checkbox') {
            el.addEventListener('change', () => {
                document.getElementById('step2').classList.remove('show');
                document.getElementById('results').classList.remove('show');
            });
        }
    }
});

// Si un dé est modifié, masquer les résultats
['attaquant-de', 'defenseur-de'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', () => {
            document.getElementById('results').classList.remove('show');
        });
    }
});

// ===========================
// MODALE BILAN MAITRE DE SALLE
// ===========================

function ouvrirBilanMaitre() {
    const bilanModal = document.getElementById('bilan-maitre-modal');
    const bilanTableau = document.getElementById('bilan-tableau');
    
    // Générer le tableau de bilan
    bilanTableau.innerHTML = genererBilanTableau();
    
    // Afficher la modale
    bilanModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    bilanModal.focus();
}

function genererBilanTableau() {
    // Vérifier que les résultats du combat sont disponibles
    if (!gameData.resultats) {
        return '<div class="error">Veuillez d\'abord calculer un combat pour générer le bilan.</div>';
    }

    const { ressourcesDesirees, resultats } = gameData;

    // Utiliser les nouvelles données complètes
    const {
        R,
        ressourcesVolees,
        attaquants,
        defenseurs,
        pertesAttaquantsData,
        pertesDefenseursData
    } = resultats;

    // Construire le tableau
    let html = `
        <div class="bilan-tableau">
            <div class="bilan-header">
                Bilan des ressources par village
            </div>
            <div class="bilan-row header">
                <div>Village</div>
                <div>Statut</div>
                <div>Matériaux</div>
                <div>Guerriers</div>
                <div>Potions</div>
                <div>Argent</div>
            </div>
    `;

    // Générer toutes les lignes pour les attaquants dynamiquement
    if (attaquants && pertesAttaquantsData) {
        attaquants.forEach((attaquant, index) => {
            const pertesData = pertesAttaquantsData[index] || { pertesFinales: 0 };
            const isMain = index === 0;
            
            // Statut et récompenses pour le principal seulement
            let statutAttaquant, classStatutAttaquant;
            let materiauxAttaquant = 0;
            let argentAttaquant = 0;
            
            if (isMain) {
                statutAttaquant = R > 0 ? 'Gagnant' : 'Perdant';
                classStatutAttaquant = R > 0 ? 'statut-gagnant' : 'statut-perdant';
                
                if (R > 0 && ressourcesDesirees === 'materiaux') {
                    materiauxAttaquant = ressourcesVolees;
                } else if (R > 0 && ressourcesDesirees === 'argent') {
                    argentAttaquant = ressourcesVolees;
                }
            } else {
                statutAttaquant = 'Soutien Attaque';
                classStatutAttaquant = 'statut-soutien';
            }
            
            const potionsConsommees = -(attaquant.potions || 0);

            html += `
                <div class="bilan-row">
                    <div class="bilan-village">${attaquant.nom}</div>
                    <div class="bilan-statut ${classStatutAttaquant}">${statutAttaquant}</div>
                    <div class="bilan-materiaux ${materiauxAttaquant > 0 ? 'gain' : materiauxAttaquant < 0 ? 'perte' : 'neutre'}">
                    ${materiauxAttaquant > 0 ? '+' : ''}${materiauxAttaquant}
                    </div>
                    <div class="bilan-guerriers ${pertesData.pertesFinales > 0 ? 'perte' : 'neutre'}">
                    ${pertesData.pertesFinales > 0 ? '-' : ''}${pertesData.pertesFinales}
                    </div>
                    <div class="bilan-potions ${potionsConsommees < 0 ? 'perte' : 'neutre'}">
                        ${potionsConsommees}
                    </div>
                    <div class="bilan-argent ${argentAttaquant > 0 ? 'gain' : argentAttaquant < 0 ? 'perte' : 'neutre'}">
                        ${argentAttaquant > 0 ? '+' : ''}${argentAttaquant}
                    </div>
                </div>
            `;
        });
    }

    // Générer toutes les lignes pour les défenseurs dynamiquement
    if (defenseurs && pertesDefenseursData) {
        defenseurs.forEach((defenseur, index) => {
            const pertesData = pertesDefenseursData[index] || { pertesFinales: 0 };
            const isMain = index === 0;
            
            // Statut et pertes de ressources pour le principal seulement
            let statutDefenseur, classStatutDefenseur;
            let materiauxDefenseur = 0;
            let argentDefenseur = 0;
            
            if (isMain) {
                statutDefenseur = R <= 0 ? 'Gagnant' : 'Perdant';
                classStatutDefenseur = R <= 0 ? 'statut-gagnant' : 'statut-perdant';
                
                if (R > 0 && ressourcesDesirees === 'materiaux') {
                    materiauxDefenseur = -ressourcesVolees;
                } else if (R > 0 && ressourcesDesirees === 'argent') {
                    argentDefenseur = -ressourcesVolees;
                }
            } else {
                statutDefenseur = 'Soutien Défense';
                classStatutDefenseur = 'statut-soutien';
            }

            html += `
                <div class="bilan-row">
                    <div class="bilan-village">${defenseur.nom}</div>
                    <div class="bilan-statut ${classStatutDefenseur}">${statutDefenseur}</div>
                    <div class="bilan-materiaux ${materiauxDefenseur > 0 ? 'gain' : materiauxDefenseur < 0 ? 'perte' : 'neutre'}">
                    ${materiauxDefenseur > 0 ? '+' : ''}${materiauxDefenseur}
                    </div>
                    <div class="bilan-guerriers ${pertesData.pertesFinales > 0 ? 'perte' : 'neutre'}">
                    ${pertesData.pertesFinales > 0 ? '-' : ''}${pertesData.pertesFinales}
                    </div>
                    <div class="bilan-potions neutre">0</div>
                    <div class="bilan-argent ${argentDefenseur > 0 ? 'gain' : argentDefenseur < 0 ? 'perte' : 'neutre'}">
                        ${argentDefenseur > 0 ? '+' : ''}${argentDefenseur}
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    
    return html;
}

// Gestion de la fermeture de la modale bilan
const bilanModal = document.getElementById('bilan-maitre-modal');
const closeBilanModal = document.getElementById('close-bilan-modal');

if (closeBilanModal) {
    closeBilanModal.addEventListener('click', () => {
        bilanModal.style.display = 'none';
        document.body.style.overflow = '';
    });
}

if (bilanModal) {
    bilanModal.addEventListener('click', (e) => {
        if (e.target === bilanModal) {
            bilanModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (bilanModal && bilanModal.style.display === 'flex' && (e.key === 'Escape' || e.key === 'Esc')) {
        bilanModal.style.display = 'none';
        document.body.style.overflow = '';
    }
});