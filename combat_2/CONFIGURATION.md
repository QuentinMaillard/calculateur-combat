# 📋 Configuration du système d'alliés

## 🎯 Nouvelles constantes de configuration

Le système utilise maintenant deux constantes simples pour contrôler les alliés :

```javascript
const MAX_ALLIES_ATTAQUANT = 3; // Nombre maximum d'alliés attaquants
const MAX_ALLIES_DEFENSEUR = 3; // Nombre maximum d'alliés défenseurs
```

## 🔧 Modes de fonctionnement

### Mode 0 : Pas d'alliés
```javascript
const MAX_ALLIES_ATTAQUANT = 0;
const MAX_ALLIES_DEFENSEUR = 0;
```
- ❌ Aucun bouton d'allié affiché
- ✅ Combat 1v1 uniquement
- 🎯 Usage : Combats simples, événements spéciaux

### Mode 1 : Allié classique uniquement  
```javascript
const MAX_ALLIES_ATTAQUANT = 1;
const MAX_ALLIES_DEFENSEUR = 1;
```
- ✅ Un seul bouton "Ajouter un allié"
- ✅ Combat 2v2 maximum
- ❌ Pas de boutons d'alliés multiples
- 🎯 Usage : Système classique simple

### Mode 2+ : Alliés multiples
```javascript
const MAX_ALLIES_ATTAQUANT = 3;
const MAX_ALLIES_DEFENSEUR = 2;
```
- ✅ Allié classique disponible
- ✅ Boutons d'alliés multiples
- ✅ Combat 4v3 dans cet exemple
- 🎯 Usage : Batailles épiques, sièges

## 🎨 Exemples de configurations

### Configuration équilibrée (défaut)
```javascript
const MAX_ALLIES_ATTAQUANT = 3;
const MAX_ALLIES_DEFENSEUR = 3;
```
**Résultat** : Batailles jusqu'à 4v4

### Configuration asymétrique (siège)
```javascript
const MAX_ALLIES_ATTAQUANT = 2;
const MAX_ALLIES_DEFENSEUR = 1;
```
**Résultat** : Max 3v2 (avantage attaquant)

### Configuration défensive
```javascript
const MAX_ALLIES_ATTAQUANT = 1;
const MAX_ALLIES_DEFENSEUR = 4;
```
**Résultat** : Max 2v5 (avantage défenseur)

### Configuration événement spécial
```javascript
const MAX_ALLIES_ATTAQUANT = 0;
const MAX_ALLIES_DEFENSEUR = 0;
```
**Résultat** : Duels 1v1 uniquement

## ⚡ Fonctionnalités dynamiques

Le système s'adapte automatiquement :
- 🎯 **Boutons cachés** si alliés désactivés
- 🎯 **Textes adaptés** selon le mode (classique/multiple)
- 🎯 **Limites respectées** selon les constantes
- 🎯 **Validation automatique** des formulaires
- 🎯 **Calculs corrects** pour tous les modes

## 🔄 Changement de configuration

Pour changer la configuration :
1. Modifier les constantes en début de `script.js`
2. Recharger la page
3. L'interface s'adapte automatiquement !

Aucun autre code à modifier ! 🎉