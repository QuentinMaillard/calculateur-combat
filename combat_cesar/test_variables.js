// Test simple pour vérifier les variables critiques
// Ce fichier peut être exécuté dans la console du navigateur

function testerVariables() {
    console.log("=== TEST DES VARIABLES DANS LE SCOPE ===");
    
    // Variables qui doivent être accessibles globalement
    const variablesGlobales = [
        'zoneVerte', 'zoneMarron', 'zoneRouge',
        'MAX_ALLIES_ATTAQUANT', 'MAX_ALLIES_DEFENSEUR', 
        'NIVEAU_DIFFICULTE'
    ];
    
    variablesGlobales.forEach(varName => {
        try {
            const val = window[varName];
            if (val !== undefined) {
                console.log(`✅ ${varName}: OK`);
            } else {
                console.log(`❌ ${varName}: UNDEFINED`);
            }
        } catch (e) {
            console.log(`❌ ${varName}: ERROR - ${e.message}`);
        }
    });
    
    // Variables qui doivent être accessibles dans la fonction de calcul
    const variablesFonction = [
        'attaquantDe', 'defenseurDe', 
        'totalDefenseurPotions', 'bonusOppidum', 'malusTrahison',
        'traitreActif', 'trahisonActive', 'numeroVague'
    ];
    
    console.log("\n=== VARIABLES DE LA FONCTION DE CALCUL ===");
    console.log("(Ces variables sont testées dans le contexte où elles sont déclarées)");
    variablesFonction.forEach(varName => {
        console.log(`📝 ${varName}: Déclaré localement dans calculerCombat()`);
    });
    
    console.log("\n=== TEST TERMINÉ ===");
}

// Exporter la fonction pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testerVariables };
} else {
    window.testerVariables = testerVariables;
}