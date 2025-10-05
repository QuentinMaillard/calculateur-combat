// ===========================
// Variables globales
// ===========================
let transactionData = {};

// ===========================
// Fonctions d'initialisation
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du bouton d'aide
    const helpBtn = document.getElementById('help-btn');
    const rulesModal = document.getElementById('rules-modal');
    const closeRulesModal = document.getElementById('close-rules-modal');

    helpBtn.addEventListener('click', () => {
        rulesModal.style.display = 'flex';
    });

    closeRulesModal.addEventListener('click', () => {
        rulesModal.style.display = 'none';
    });

    // Fermer les modales en cliquant sur l'overlay
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Fermer les modales avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });

    // Gestion du bilan maître
    const bilanModal = document.getElementById('bilan-modal');
    const closeBilanModal = document.getElementById('close-bilan-modal');
    
    closeBilanModal.addEventListener('click', () => {
        bilanModal.style.display = 'none';
    });
});

// ===========================
// Fonctions de validation
// ===========================
function collecterDonneesTransaction() {
    const donnees = {
        village1: {
            nom: document.getElementById('village1-nom').value.trim() || 'Village 1',
            donne: {
                materiaux: parseInt(document.getElementById('village1-donne-materiaux').value) || 0,
                potions: parseInt(document.getElementById('village1-donne-potions').value) || 0,
                argent: parseInt(document.getElementById('village1-donne-argent').value) || 0
            }
        },
        village2: {
            nom: document.getElementById('village2-nom').value.trim() || 'Village 2',
            donne: {
                materiaux: parseInt(document.getElementById('village2-donne-materiaux').value) || 0,
                potions: parseInt(document.getElementById('village2-donne-potions').value) || 0,
                argent: parseInt(document.getElementById('village2-donne-argent').value) || 0
            }
        }
    };

    return donnees;
}

function calculerBilan(donnees) {
    // Calcule automatiquement ce que chaque village gagne/perd
    const bilan = {
        village1: {
            nom: donnees.village1.nom,
            materiaux: donnees.village2.donne.materiaux - donnees.village1.donne.materiaux,
            potions: donnees.village2.donne.potions - donnees.village1.donne.potions,
            argent: donnees.village2.donne.argent - donnees.village1.donne.argent
        },
        village2: {
            nom: donnees.village2.nom,
            materiaux: donnees.village1.donne.materiaux - donnees.village2.donne.materiaux,
            potions: donnees.village1.donne.potions - donnees.village2.donne.potions,
            argent: donnees.village1.donne.argent - donnees.village2.donne.argent
        }
    };

    return bilan;
}

function obtenirNomRessource(cle) {
    const noms = {
        materiaux: 'Matériaux 🏗️',
        potions: 'Potions 🧪',
        argent: 'Argent 🪙'
    };
    return noms[cle] || cle;
}

function aUneTransaction(donnees) {
    const ressources = ['materiaux', 'potions', 'argent'];
    
    return ressources.some(ressource => 
        donnees.village1.donne[ressource] > 0 || 
        donnees.village2.donne[ressource] > 0
    );
}

// ===========================
// Fonction principale de validation
// ===========================
function validerTransaction() {
    const donnees = collecterDonneesTransaction();
    
    // Vérifier que les noms des villages sont renseignés
    const village1Nom = document.getElementById('village1-nom').value.trim();
    const village2Nom = document.getElementById('village2-nom').value.trim();
    
    if (!village1Nom || !village2Nom) {
        let message = 'Veuillez renseigner les noms des villages :\n';
        if (!village1Nom) message += '• Nom du Village 1 manquant\n';
        if (!village2Nom) message += '• Nom du Village 2 manquant';
        
        afficherErreur(message);
        return;
    }
    
    // Vérifier qu'il y a au moins une transaction
    if (!aUneTransaction(donnees)) {
        afficherErreur('Aucune transaction détectée. Veuillez saisir au moins une ressource à échanger.');
        return;
    }

    // Transaction valide, stocker les données et afficher le résultat
    transactionData = donnees;
    afficherResultat();
}

// ===========================
// Fonctions d'affichage
// ===========================
function afficherErreur(message) {
    // Supprimer les anciens messages d'erreur
    const anciennesErreurs = document.querySelectorAll('.error-message');
    anciennesErreurs.forEach(erreur => erreur.remove());

    // Créer le nouveau message d'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = message.replace(/\n/g, '<br>');

    // L'insérer avant les boutons
    const buttonContainer = document.querySelector('#step1 .button-container');
    buttonContainer.parentNode.insertBefore(errorDiv, buttonContainer);

    // Faire défiler vers l'erreur
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function afficherResultat() {
    // Masquer l'étape 1 et afficher les résultats
    document.getElementById('step1').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    // Générer le contenu du résultat
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = genererTableauTransaction();

    // Faire défiler vers les résultats
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function genererTableauTransaction() {
    const donnees = transactionData;
    const bilan = calculerBilan(donnees);
    let html = '';

    // Tableau simple des échanges
    html += '<h3>📊 Bilan de la Transaction</h3>';
    html += '<table class="transaction-table">';
    html += '<thead><tr>';
    html += '<th>Village</th>';
    html += '<th>Matériaux 🏗️</th>';
    html += '<th>Potions 🧪</th>';
    html += '<th>Argent 🪙</th>';
    html += '</tr></thead><tbody>';

    // Ligne Village 1
    html += '<tr>';
    html += '<td><strong>' + bilan.village1.nom + '</strong></td>';
    html += '<td>' + formatSolde(bilan.village1.materiaux) + '</td>';
    html += '<td>' + formatSolde(bilan.village1.potions) + '</td>';
    html += '<td>' + formatSolde(bilan.village1.argent) + '</td>';
    html += '</tr>';

    // Ligne Village 2
    html += '<tr>';
    html += '<td><strong>' + bilan.village2.nom + '</strong></td>';
    html += '<td>' + formatSolde(bilan.village2.materiaux) + '</td>';
    html += '<td>' + formatSolde(bilan.village2.potions) + '</td>';
    html += '<td>' + formatSolde(bilan.village2.argent) + '</td>';
    html += '</tr>';

    html += '</tbody></table>';

    // Détail de ce que chaque village donne
    html += '<h3 style="margin-top: 30px;">📦 Détail des Échanges</h3>';
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">';
    
    // Village 1
    html += '<div style="background: rgba(76, 175, 80, 0.1); border: 2px solid #4caf50; border-radius: 12px; padding: 20px;">';
    html += '<h4 style="color: #388e3c; margin-bottom: 15px;">📋 ' + donnees.village1.nom + ' donne</h4>';
    html += genererListeRessources(donnees.village1.donne);
    html += '</div>';

    // Village 2
    html += '<div style="background: rgba(33, 150, 243, 0.1); border: 2px solid #2196f3; border-radius: 12px; padding: 20px;">';
    html += '<h4 style="color: #1976d2; margin-bottom: 15px;">📋 ' + donnees.village2.nom + ' donne</h4>';
    html += genererListeRessources(donnees.village2.donne);
    html += '</div>';

    html += '</div>';

    return html;
}

function formatSolde(valeur) {
    if (valeur > 0) {
        return '<span style="color: #388e3c; font-weight: bold;">+' + valeur + '</span>';
    } else if (valeur < 0) {
        return '<span style="color: #d32f2f; font-weight: bold;">' + valeur + '</span>';
    } else {
        return '<span style="color: #666;">0</span>';
    }
}

function genererListeRessources(ressources) {
    let html = '';
    const ressourcesTypes = [
        { cle: 'materiaux', nom: 'Matériaux 🏗️' },
        { cle: 'potions', nom: 'Potions 🧪' },
        { cle: 'argent', nom: 'Argent 🪙' }
    ];

    let aDesRessources = false;

    ressourcesTypes.forEach(type => {
        const quantite = ressources[type.cle];
        if (quantite > 0) {
            aDesRessources = true;
            html += '<div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px;">';
            html += '<strong>' + type.nom + ' : ' + quantite + '</strong>';
            html += '</div>';
        }
    });

    if (!aDesRessources) {
        html += '<p style="font-style: italic; color: #666;">Rien</p>';
    }

    return html;
}

// ===========================
// Fonctions du bilan maître
// ===========================
function ouvrirBilanMaitre() {
    const modal = document.getElementById('bilan-modal');
    const contenu = document.getElementById('bilan-maitre-contenu');
    
    contenu.innerHTML = genererBilanMaitre();
    modal.style.display = 'flex';
}

function genererBilanMaitre() {
    const donnees = transactionData;
    const bilan = calculerBilan(donnees);
    let html = '';

    // En-tête
    html += '<div style="text-align: center; margin-bottom: 30px; padding: 20px; background: rgba(191, 167, 106, 0.1); border-radius: 12px;">';
    html += '<h3 style="color: #3e2c13; margin: 0;">Transaction Commerciale Validée</h3>';
    html += '<p style="color: #5a3f1a; margin: 10px 0 0 0; font-size: 1.1em;">';
    html += '<strong>' + donnees.village1.nom + '</strong> ⟷ <strong>' + donnees.village2.nom + '</strong>';
    html += '</p>';
    html += '</div>';

    // Tableau principal du bilan
    html += '<h4 style="color: #3e2c13; margin-bottom: 15px;">📊 Bilan Final</h4>';
    html += '<table class="transaction-table" style="margin-bottom: 30px;">';
    html += '<thead><tr>';
    html += '<th>Village</th>';
    html += '<th>Matériaux 🏗️</th>';
    html += '<th>Potions 🧪</th>';
    html += '<th>Argent 🪙</th>';
    html += '</tr></thead><tbody>';

    // Ligne Village 1
    html += '<tr>';
    html += '<td><strong>' + bilan.village1.nom + '</strong></td>';
    html += '<td>' + formatSoldeMaitre(bilan.village1.materiaux) + '</td>';
    html += '<td>' + formatSoldeMaitre(bilan.village1.potions) + '</td>';
    html += '<td>' + formatSoldeMaitre(bilan.village1.argent) + '</td>';
    html += '</tr>';

    // Ligne Village 2
    html += '<tr>';
    html += '<td><strong>' + bilan.village2.nom + '</strong></td>';
    html += '<td>' + formatSoldeMaitre(bilan.village2.materiaux) + '</td>';
    html += '<td>' + formatSoldeMaitre(bilan.village2.potions) + '</td>';
    html += '<td>' + formatSoldeMaitre(bilan.village2.argent) + '</td>';
    html += '</tr>';

    html += '</tbody></table>';

    // Détail des échanges
    html += '<h4 style="color: #3e2c13; margin-bottom: 15px;">📦 Ce que donne chaque village</h4>';
    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">';
    
    // Village 1
    html += '<div style="background: rgba(76, 175, 80, 0.1); border: 2px solid #4caf50; border-radius: 12px; padding: 15px;">';
    html += '<h5 style="color: #388e3c; margin-bottom: 10px; text-align: center;">' + donnees.village1.nom + ' donne</h5>';
    html += genererListeRessourcesMaitre(donnees.village1.donne);
    html += '</div>';

    // Village 2
    html += '<div style="background: rgba(33, 150, 243, 0.1); border: 2px solid #2196f3; border-radius: 12px; padding: 15px;">';
    html += '<h5 style="color: #1976d2; margin-bottom: 10px; text-align: center;">' + donnees.village2.nom + ' donne</h5>';
    html += genererListeRessourcesMaitre(donnees.village2.donne);
    html += '</div>';
    
    html += '</div>';

    // Instructions pour le maître
    html += '<div style="background: rgba(255, 152, 0, 0.1); border: 2px solid #ff9800; border-radius: 12px; padding: 20px; margin-top: 20px;">';
    html += '<h4 style="color: #f57c00; margin-bottom: 15px;">🎯 Instructions pour le Maître de Salle</h4>';
    html += '<ul style="color: #3e2c13; line-height: 1.6;">';
    html += '<li><strong>Vérifier les stocks :</strong> S\'assurer que chaque village possède bien les ressources qu\'il souhaite donner</li>';
    html += '<li><strong>Confirmer l\'accord :</strong> Valider que les deux villages sont d\'accord avec cette transaction</li>';
    html += '<li><strong>Enregistrer :</strong> Noter cette transaction dans les registres des villages concernés</li>';
    html += '</ul>';
    html += '</div>';

    return html;
}

function formatSoldeMaitre(valeur) {
    if (valeur > 0) {
        return '<span style="color: #388e3c; font-weight: bold; font-size: 1.1em;">+' + valeur + '</span>';
    } else if (valeur < 0) {
        return '<span style="color: #d32f2f; font-weight: bold; font-size: 1.1em;">' + valeur + '</span>';
    } else {
        return '<span style="color: #666; font-size: 1.1em;">0</span>';
    }
}

function genererListeRessourcesMaitre(ressources) {
    let html = '';
    const ressourcesTypes = [
        { cle: 'materiaux', nom: 'Matériaux 🏗️' },
        { cle: 'potions', nom: 'Potions 🧪' },
        { cle: 'argent', nom: 'Argent 🪙' }
    ];

    let aDesRessources = false;

    ressourcesTypes.forEach(type => {
        const quantite = ressources[type.cle];
        if (quantite > 0) {
            aDesRessources = true;
            html += '<div style="margin: 5px 0; color: #3e2c13; font-weight: 500;">';
            html += type.nom + ' : ' + quantite;
            html += '</div>';
        }
    });

    if (!aDesRessources) {
        html += '<div style="color: #666; font-style: italic;">Rien</div>';
    }

    return html;
}

// ===========================
// Fonctions utilitaires
// ===========================
function reinitialiser() {
    // Réinitialiser tous les champs
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    inputs.forEach(input => {
        if (input.type === 'number') {
            input.value = '0';
        } else {
            input.value = '';
        }
    });

    // Supprimer les messages d'erreur
    const erreurs = document.querySelectorAll('.error-message');
    erreurs.forEach(erreur => erreur.remove());

    // Remettre les placeholders par défaut
    document.getElementById('village1-nom').placeholder = 'Nom du village';
    document.getElementById('village2-nom').placeholder = 'Nom du village';

    // Faire défiler vers le haut
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nouvelleTransaction() {
    // Réinitialiser tout
    reinitialiser();
    
    // Revenir à l'étape 1
    document.getElementById('results').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    
    // Vider les données de transaction
    transactionData = {};
    
    // Faire défiler vers le haut
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth', block: 'start' });
}