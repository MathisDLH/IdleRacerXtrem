# IdleRacerXtrem

## Aperçu
IdleRacerXtrem est un prototype de jeu de course au ralenti composé d'un back-end [NestJS](https://nestjs.com/) et d'une interface web en [React](https://react.dev/). L'ensemble est conteneurisé pour être déployé rapidement dans différents environnements.

## C2.1.1 – Protocole de déploiement continu et critères de qualité
- **Environnement de développement :** Node.js 18, NestJS, React, MySQL, Redis. Le projet peut être développé avec n'importe quel éditeur supportant TypeScript (VS Code, WebStorm…).
- **Outils de qualité et de performance :** linting via ESLint/Prettier, tests unitaires Jest, métriques exposées pour Prometheus/Grafana.
- **Protocole de déploiement :**
  1. push du code sur Git ;
  2. exécution des tests et du lint ;
  3. construction des images Docker ;
  4. déploiement sur l'environnement de staging puis production via `docker compose`.

## C2.1.2 – Protocole d’intégration continue
Chaque fusion sur la branche principale déclenche une intégration automatique : installation des dépendances, lint, compilation et exécution des tests Jest. Les étapes doivent réussir avant la validation de la fusion.

## C2.2.1 – Architecture, prototype et frameworks
L'application suit une architecture en trois couches :
- **Front :** React + Vite, composants MUI.
- **Back :** API NestJS exposant les services du jeu et la sécurité JWT.
- **Base de données et cache :** MySQL et Redis.
Un prototype web est fourni dans `front/` et peut être lancé en mode développement avec `npm run dev`.

## C2.2.2 – Harnais de tests unitaires
Le back‑end dispose d'un jeu de tests Jest couvrant les services principaux et permettant de détecter les régressions. L'exécution s'effectue avec :

```bash
cd back
npm test
```

## C2.2.3 – Sécurisation et accessibilité
- **Sécurité :** mots de passe hachés via bcrypt, authentification JWT et validation des entrées via class‑validator pour limiter les failles OWASP les plus courantes.
- **Accessibilité :** l'interface React s'appuie sur les composants MUI conformes au RGAA et utilise des attributs ARIA afin de faciliter la navigation clavier et lecteur d'écran.

## C2.2.4 – Versionnement et déploiement progressif
Git conserve l’historique des versions et chaque commit est déployé de façon incrémentale. Les images Docker sont construites à partir des fichiers `Dockerfile` du front et du back puis publiées sur l'environnement cible.

## C2.3.1 – Cahier de recettes
Les scénarios de tests fonctionnels décrivent les parcours utilisateurs (inscription, connexion, lancement d’une course…) et les résultats attendus. Ils servent de base à la validation manuelle et automatisée.

## C2.3.2 – Plan de correction des bogues
Toute anomalie détectée est enregistrée dans un ticket précisant la reproduction, l’analyse de cause et la correction proposée. Chaque correctif est accompagné d’un test et fait l’objet d’une revue de code.

## C2.4.1 – Documentation d’exploitation
### Manuel de déploiement
Pour démarrer l’environnement de développement :

```bash
docker compose up -d
```

Pour lancer la pile de production :

```bash
docker compose -f docker-compose.prod.yml up -d
```

Grafana est disponible sur `http://localhost:3001` et Prometheus sur `http://localhost:9090`.

### Manuel d’utilisation
1. Démarrer la pile Docker.
2. Accéder à l’interface web sur `http://localhost:5173`.
3. Créer un compte ou se connecter pour gérer ses courses.

### Manuel de mise à jour
1. Récupérer les dernières modifications : `git pull`.
2. Mettre à jour les dépendances : `npm install` dans `front/` et `back/`.
3. Reconstruire et redéployer les conteneurs Docker.

