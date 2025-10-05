let gameData = {};

document.getElementById('action-desiree').addEventListener('change', function () {
    if (this.value === 'potion') {
        document.getElementById('potions-dispo-group').style.display = '';
        document.getElementById('materiaux-dispo-group').style.display = 'none';
    } else {
        document.getElementById('potions-dispo-group').style.display = 'none';
        document.getElementById('materiaux-dispo-group').style.display = '';
    }
});

// Limite dynamique sur le champ Potions utilisées (M1) : max = Guerriers (G1)
const attaquantGuerriersInput = document.getElementById('attaquant-guerriers');
const attaquantPotionsInput = document.getElementById('attaquant-potions');

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
    // Désactive aussi l'option "potion" dans le select action-desiree si pas de guerriers
    // const actionDesireeSelect = document.getElementById('action-desiree');
    // const potionOption = actionDesireeSelect.querySelector('option[value="potion"]');
    // if (potionOption) {
    //     potionOption.disabled = g1 === 0;
    //     // Si potion est sélectionné alors qu'il n'y a pas de guerriers, on bascule sur matériaux
    //     if (g1 === 0 && actionDesireeSelect.value === 'potion') {
    //         actionDesireeSelect.value = 'materiaux';
    //         // Déclenche le changement pour afficher le bon champ de ressources
    //         actionDesireeSelect.dispatchEvent(new Event('change'));
    //     }
    // }
}
attaquantGuerriersInput.addEventListener('input', updateMaxPotions);

// Appel initial pour l'état au chargement
updateMaxPotions();

// Vérification supplémentaire lors de la validation
function validerEtape1() {
    const attaquantNom = document.getElementById('attaquant-nom').value.trim();
    const attaquantGuerriers = parseInt(document.getElementById('attaquant-guerriers').value) || 0;
    const attaquantPotions = parseInt(document.getElementById('attaquant-potions').value) || 0;
    const defenseur1Nom = document.getElementById('defenseur1-nom').value.trim();
    const defenseur1Guerriers = parseInt(document.getElementById('defenseur1-guerriers').value) || 0;
    // Défenseur ne peut plus utiliser de potion
    // const defenseur1Potions = parseInt(document.getElementById('defenseur1-potions').value) || 0;
    const oppidumActif = document.getElementById('oppidum-actif').checked;
    const defenseur2Nom = document.getElementById('defenseur2-nom').value.trim();
    const defenseur2Guerriers = parseInt(document.getElementById('defenseur2-guerriers').value) || 0;
    const ressourcesDesirees = document.getElementById('action-desiree').value;

    let potionsDisponibles = 0;
    let materiauxDisponibles = 0;
    if (ressourcesDesirees === 'potion') {
        potionsDisponibles = parseInt(document.getElementById('potions-disponibles').value) || 0;
    } else {
        materiauxDisponibles = parseInt(document.getElementById('materiaux-disponibles').value) || 0;
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

    if (attaquantGuerriers === 0 && attaquantPotions === 0) {
        errorMsg.textContent = "⚠️ L'attaquant doit engager au moins des guerriers ou des Guerriers sous potion";
        errorMsg.classList.add('show');
        return;
    }

    if (defenseur2Guerriers > 0 && !defenseur2Nom) {
        errorMsg.textContent = "⚠️ Si un allié envoie des guerriers, son nom doit être renseigné";
        errorMsg.classList.add('show');
        return;
    }

    if (attaquantPotions > attaquantGuerriers) {
        errorMsg.textContent = "⚠️ Vous ne pouvez pas utiliser plus de potions que de guerriers engagés.";
        errorMsg.classList.add('show');
        return;
    }

    // Plus de vérification de potions défenseur

    // Stocker les données
    gameData = {
        attaquantNom,
        attaquantGuerriers,
        attaquantPotions,
        defenseur1Nom,
        defenseur1Guerriers,
        // defenseur1Potions: 0, // plus utilisé
        oppidumActif,
        defenseur2Nom,
        defenseur2Guerriers,
        ressourcesDesirees,
        potionsDisponibles,
        materiauxDisponibles
    };

    // Remplir le récapitulatif
    document.getElementById('summary-attaquant-nom').textContent = attaquantNom;
    document.getElementById('summary-attaquant-guerriers').textContent = attaquantGuerriers;
    document.getElementById('summary-attaquant-potions').textContent = attaquantPotions;
    document.getElementById('summary-ressources').textContent = ressourcesDesirees === 'potion' ? 'Potions' : 'Matériaux';

    document.getElementById('summary-defenseur-nom').textContent = defenseur1Nom;
    document.getElementById('summary-defenseur-guerriers').textContent = defenseur1Guerriers;
    document.getElementById('summary-oppidum').textContent = oppidumActif ? "Oui (x2)" : "Non";

    if (defenseur2Guerriers > 0) {
        document.getElementById('summary-allie-nom').textContent = defenseur2Nom;
        document.getElementById('summary-allie-guerriers').textContent = defenseur2Guerriers;
        document.getElementById('summary-allie-line').style.display = 'block';
    } else {
        document.getElementById('summary-allie-line').style.display = 'none';
    }

    document.getElementById('summary-defenseur-ressources').textContent =
        ressourcesDesirees === 'potion'
            ? (potionsDisponibles + ' potions')
            : (materiauxDisponibles + ' matériaux');

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

if (rollDiceAttaquantBtn) {
    rollDiceAttaquantBtn.addEventListener('click', function () {
        rollDiceAttaquantBtn.textContent = 'Alea jacta est';
        rollDiceAttaquantBtn.disabled = true;
        rollDiceAttaquantBtn.classList.add('disabled');
        animateDiceRoll(attaquantDeResult, function () {
            attaquantDe = Math.floor(Math.random() * 10) + 1;
            attaquantDeResult.textContent = attaquantDe;
            // Le bouton reste désactivé après le lancer
            updateCalcBtnState();
        });
    });
}
if (rollDiceDefenseurBtn) {
    rollDiceDefenseurBtn.addEventListener('click', function () {
        rollDiceDefenseurBtn.textContent = 'Alea jacta est';
        rollDiceDefenseurBtn.disabled = true;
        rollDiceDefenseurBtn.classList.add('disabled');
        animateDiceRoll(defenseurDeResult, function () {
            defenseurDe = Math.floor(Math.random() * 10) + 1;
            defenseurDeResult.textContent = defenseurDe;
            // Le bouton reste désactivé après le lancer
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
        attaquantNom,
        attaquantGuerriers,
        attaquantPotions,
        defenseur1Nom,
        defenseur1Guerriers,
        oppidumActif,
        defenseur2Nom,
        defenseur2Guerriers,
        ressourcesDesirees,
        potionsDisponibles,
        materiauxDisponibles
    } = gameData;

    const aAllie = defenseur2Guerriers > 0;

    // Calculs de combat
    // Oppidum : ajoute +G2 (et +G3 si allié) à la défense, mais ne double plus les effectifs
    let defenseur1GuerriersEff = defenseur1Guerriers;
    let defenseur2GuerriersEff = defenseur2Guerriers;
    let bonusOppidum = 0;
    if (oppidumActif) {
        bonusOppidum += defenseur1Guerriers;
        if (defenseur2Guerriers > 0) {
            bonusOppidum += defenseur2Guerriers;
        }
    }

    // Potion donne un bonus de +0.5 par potion utilisée à l'attaque
    const A = attaquantGuerriers + attaquantDe + (attaquantPotions * 0.5);
    const D = defenseur1GuerriersEff + defenseur2GuerriersEff + bonusOppidum + defenseurDe;
    const R = A - D;

    // Calcul des ressources volées (inchangé)
    let V = 0;
    let ressourcesVolees = '';
    if (R > 0) {
        V = Math.ceil(R / 2);

        if (ressourcesDesirees === 'potion') {
            V = Math.ceil(V / 2);
            const X = potionsDisponibles - V;
            if (X >= 0) {
                ressourcesVolees = `${V} potion(s)`;
            } else {
                ressourcesVolees = `${potionsDisponibles} potion(s) (stocks épuisés)`;
                // NE PAS SUPPRIMER CE CODE, il pourrait servir plus tard
                // // Il manque de l'or, on regarde les matériaux
                // const manque = materiauxDisponibles - (-X);
                // if (materiauxDisponibles === 0 && potionsDisponibles === 0) {
                //     ressourcesVolees = `Aucun (stocks vides)`;
                // } else if (materiauxDisponibles === 0) {
                //     ressourcesVolees = `${potionsDisponibles} potions (stocks épuisés)`;
                // } else if (manque >= 0) {
                //     ressourcesVolees = `${potionsDisponibles} potions + ${-X} matériaux`;
                // } else {
                //     ressourcesVolees = `${potionsDisponibles} potions + ${materiauxDisponibles} matériaux (stocks épuisés)`;
                // }
            }
        } else {
            const X = materiauxDisponibles - V;
            if (X >= 0) {
                ressourcesVolees = `${V} matériau(x)`;
            } else {
                ressourcesVolees = `${materiauxDisponibles} matériau(x) (stocks épuisés)`;
                // NE PAS SUPPRIMER CE CODE, il pourrait servir plus tard
                // // Il manque de l'or, on regarde les matériaux
                // const manque = potionsDisponibles - (-X);
                // if (potionsDisponibles === 0 && materiauxDisponibles === 0) {
                //     ressourcesVolees = `Aucun (stocks vides)`;
                // } else if (potionsDisponibles === 0) {
                //     ressourcesVolees = `${materiauxDisponibles} matériaux (stocks épuisés)`;
                // } else if (manque >= 0) {
                //     ressourcesVolees = `${materiauxDisponibles} matériaux + ${-X} or`;
                // } else {
                //     ressourcesVolees = `${materiauxDisponibles} matériaux + ${potionsDisponibles} or (stocks épuisés)`;
                // }
            }
        }
    } else {
        ressourcesVolees = 'Aucune';
    }

    /**
     * Calcule les pertes de guerriers selon la taille des armées, les jets de dés et l'issue du combat.
     * @param {number} guerriers - Guerriers engagés pour ce camp
     * @param {number} de - Jet de dé de ce camp
     * @param {number} guerriersAdverse - Guerriers engagés pour l'adversaire
     * @param {number} deAdverse - Jet de dé de l'adversaire
     * @param {boolean} victoire - true si ce camp a gagné, false sinon
     * @returns {{ pertes: number, pourcentage: number }}
     */
    function calculerPertesAvancees(guerriers, de, guerriersAdverse, deAdverse, victoire) {
        if (guerriers === 0) return { pertes: 0, pourcentage: 0 };

        // Rapport de force
        let rapport = guerriersAdverse === 0 ? 2 : guerriers / guerriersAdverse;
        // Bonus/malus de dé
        let bonusDe = de - deAdverse;

        let base;
        if (victoire) {
            if (rapport > 1.5) base = 2;
            else if (rapport < 0.7) base = 10;
            else base = 5;
            // Ajustement selon le jet de dé
            if (bonusDe >= 4) base = Math.max(1, base - 2);
            if (bonusDe <= -4) base = Math.min(15, base + 3);
        } else {
            if (rapport < 0.7) base = 35;
            else if (rapport > 1.5) base = 15;
            else base = 25;
            // Ajustement selon le jet de dé
            if (bonusDe <= -4) base = Math.min(50, base + 10);
            if (bonusDe >= 4) base = Math.max(5, base - 5);
        }

        // Clamp pour éviter l'abus
        base = Math.max(1, Math.min(base, 50));

        return {
            pertes: Math.ceil(guerriers * (base / 100)),
            pourcentage: base
        };
    }

    // Calcul des pertes brutes
    const pertesAttaquantBrut = calculerPertesAvancees(
        attaquantGuerriers,
        attaquantDe,
        defenseur1GuerriersEff + defenseur2GuerriersEff,
        defenseurDe,
        R > 0
    );

    const pertesDefenseur1Brut = calculerPertesAvancees(
        defenseur1Guerriers,
        defenseurDe,
        attaquantGuerriers,
        attaquantDe,
        R <= 0
    );

    const pertesDefenseur2Brut = aAllie
        ? calculerPertesAvancees(
            defenseur2Guerriers,
            defenseurDe,
            attaquantGuerriers,
            attaquantDe,
            R <= 0
        )
        : { pertes: 0, pourcentage: 0 };

    // Application de la protection par potion (uniquement attaquant)
    const pertesAttaquant = Math.max(0, pertesAttaquantBrut.pertes - attaquantPotions);

    // Oppidum : 1 chance sur 2 de sauver chaque soldat défenseur (principal et allié)
    function oppidumSauve(pertes, oppidumActif) {
        if (!oppidumActif || pertes === 0) return pertes;
        let sauves = 0;
        for (let i = 0; i < pertes; i++) {
            if (Math.random() < 0.5) sauves++;
        }
        return pertes - sauves;
    }

    const pertesDefenseur1 = oppidumSauve(pertesDefenseur1Brut.pertes, oppidumActif);
    const pertesDefenseur2 = oppidumSauve(pertesDefenseur2Brut.pertes, oppidumActif);

    const pertesDefenseur1Sauvées = oppidumActif ? (pertesDefenseur1Brut.pertes - pertesDefenseur1) : 0;
    const pertesDefenseur2Sauvées = oppidumActif ? (pertesDefenseur2Brut.pertes - pertesDefenseur2) : 0;

    const vainqueur = R > 0 ? attaquantNom : defenseur1Nom;
    const vainqueurClass = R > 0 ? 'attaquant' : 'defenseur';

    // Affichage du total théorique de ressources à capter
    let theoriqueVole = '';
    if (R > 0) {
        theoriqueVole = `<div style="font-size:1em; color:#888; margin-bottom:8px;">
        Total théorique à piller : <strong>${V}</strong> ressources
    </div>`;
    }

    let html = `
                <div class="winner-banner ${vainqueurClass}">
                    🏆 Victoire ${vainqueurClass === 'attaquant' ? "de l'attaquand" : "du défenseur"} ${vainqueur} !
                </div>

                <div class="calculations">
                    <div class="calc-box">
                        <h3>🤺 Calcul de l'Attaque</h3>
                        <div class="calc-line">Guerriers envoyés par ${attaquantNom} (G1) : ${attaquantGuerriers}</div>
                        <div class="calc-line">Potions utilisées : ${attaquantPotions} (bonus total : +${(attaquantPotions * 0.5).toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1})})</div>
                        <div class="calc-line">Jet de dé : ${attaquantDe}</div>
                        <div class="calc-total">A = ${attaquantGuerriers} + ${attaquantDe} + (${attaquantPotions} × 0.5) = ${A}</div>
                    </div>

                    <div class="calc-box">
                        <h3>🛡️ Calcul de la Défense</h3>
                        <div class="calc-line">Guerriers mobilisés par ${defenseur1Nom} (G2) : ${defenseur1Guerriers}</div>
                        <div class="calc-line">Guerriers alliés ${defenseur2Nom || ''} (G3) : ${defenseur2Guerriers}</div>
                        ${oppidumActif ? `<div class="calc-line">Bonus oppidum : +${bonusOppidum}</div>` : ''}
                        <div class="calc-line">Jet de dé : ${defenseurDe}</div>
                        <div class="calc-total">D = ${defenseur1Guerriers} + ${defenseur2Guerriers} ${oppidumActif ? '+ ' + bonusOppidum: ''} + ${defenseurDe} = ${D}</div>
                    </div>
                </div>

                ${theoriqueVole}
                <div class="results-grid">
                    <div class="result-box">
                        <div class="result-label">Ressources pillées</div>
                        <div class="result-value" style="font-size: 1.5em;">${ressourcesVolees}</div>
                    </div>

                    <div class="result-box">
                        <div class="result-label">Pertes ${attaquantNom}</div>
                        <div class="result-value">${pertesAttaquant} guerriers</div>
                        <div class="result-detail" style="font-size:0.95em; color:#888;">(${pertesAttaquantBrut.pertes} pertes brutes − ${attaquantPotions} potions)</div>
                    </div>

                    <div class="result-box">
                        <div class="result-label">Pertes ${defenseur1Nom}</div>
                        <div class="result-value">${pertesDefenseur1} guerriers</div>
                        <div class="result-detail" style="font-size:0.95em; color:#888;">
                            (${pertesDefenseur1Brut.pertes} pertes brutes
                            ${oppidumActif ? `, ${pertesDefenseur1Sauvées} sauvés par les remparts` : ''})
                        </div>
                    </div>

                    ${aAllie ? `
                    <div class="result-box">
                        <div class="result-label">Pertes ${defenseur2Nom}</div>
                        <div class="result-value">${pertesDefenseur2} guerriers</div>
                        <div class="result-detail" style="font-size:0.95em; color:#888;">
                            (${pertesDefenseur2Brut.pertes} pertes brutes
                            ${oppidumActif ? `, ${pertesDefenseur2Sauvées} sauvés par les remparts` : ''})
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;

    document.getElementById('results-content').innerHTML = html;
    document.getElementById('results').classList.add('show');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
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
    // On cible le titre dans la section défenseur uniquement
    const defenseurSection = document.querySelector('.defenseur-section');
    if (!defenseurSection) return;
    const titre = defenseurSection.querySelector('.section-title');
    const allieBox = document.getElementById('defenseur-allie-box');
    if (titre && allieBox) {
        if (allieBox.classList.contains('visible')) {
            titre.textContent = "Défenseurs 🛡️";
        } else {
            titre.textContent = "Défenseur 🛡️";
        }
    }
}

// Ajoute la gestion de l'obligation des champs allié
function updateAllieRequired() {
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

// Mets à jour la validation pour rendre les champs allié obligatoires si visible
function checkPreparatifsValidity() {
    const attaquantNom = document.getElementById('attaquant-nom').value.trim();
    const attaquantGuerriers = parseInt(document.getElementById('attaquant-guerriers').value) || 0;
    const defenseur1Nom = document.getElementById('defenseur1-nom').value.trim();
    const defenseur1Guerriers = parseInt(document.getElementById('defenseur1-guerriers').value) || 0;
    const actionDesiree = document.getElementById('action-desiree').value;
    let ressourcesOk = false;
    if (actionDesiree === 'potion') {
        ressourcesOk = (document.getElementById('potions-disponibles').value !== '');
    } else {
        ressourcesOk = (document.getElementById('materiaux-disponibles').value !== '');
    }

    // Il faut au moins un guerrier attaquant OU une potion utilisée
    const attaquantPotions = parseInt(document.getElementById('attaquant-potions').value) || 0;
    const attaquantOk = attaquantNom && (attaquantGuerriers > 0 || attaquantPotions > 0);

    const defenseurOk = defenseur1Nom && defenseur1Guerriers >= 0;

    // Champs allié obligatoires si visible
    const allieBox = document.getElementById('defenseur-allie-box');
    const allieVisible = allieBox.classList.contains('visible');
    const defenseur2Nom = document.getElementById('defenseur2-nom').value.trim();
    const defenseur2Guerriers = document.getElementById('defenseur2-guerriers').value;
    let allieOk = true;
    if (allieVisible) {
        allieOk = defenseur2Nom.length > 0 && defenseur2Guerriers !== '';
    }

    // Ressource obligatoire selon l'action désirée
    const btn = document.getElementById('valider-preparatifs-btn');
    if (attaquantOk && defenseurOk && actionDesiree && ressourcesOk && allieOk) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

// Ajoute les écouteurs sur tous les champs obligatoires + allié
[
    'attaquant-nom', 'attaquant-guerriers', 'attaquant-potions',
    'defenseur1-nom', 'defenseur1-guerriers',
    'action-desiree', 'potions-disponibles', 'materiaux-disponibles',
    'defenseur2-nom', 'defenseur2-guerriers'
].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', checkPreparatifsValidity);
    }
});

// Mets à jour l'obligation visuelle/mécanique à chaque ouverture/fermeture de l'allié
window.addEventListener('DOMContentLoaded', function () {
    const toggleAllieBtn = document.getElementById('toggle-allie-btn');
    if (toggleAllieBtn) {
        toggleAllieBtn.addEventListener('click', function () {
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
        });
    }
    // Appel initial pour le bon affichage au chargement
    updateDefenseurTitre();
    updateAllieRequired();
    checkPreparatifsValidity();
});

// Mets aussi à jour à chaque transition (ex: animation CSS)
document.getElementById('defenseur-allie-box').addEventListener('transitionend', function (e) {
    if (this.classList.contains('visible')) {
        this.style.maxHeight = 'none';
    }
    updateAllieRequired();
    checkPreparatifsValidity();
});

// --- Masquer étapes si modification en haut ou dans les dés ---

// Tous les champs de l'étape 1
const step1Inputs = [
    'attaquant-nom', 'attaquant-guerriers', 'attaquant-potions',
    'defenseur1-nom', 'defenseur1-guerriers', 'defenseur1-potions',
    'oppidum-actif', 'defenseur2-nom', 'defenseur2-guerriers',
    'action-desiree', 'potions-disponibles', 'materiaux-disponibles'
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