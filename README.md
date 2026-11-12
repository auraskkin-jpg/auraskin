# Aura Skin

Boutique React/Vite avec une API Rust (Axum) et une base SQLite. Les commandes sont enregistrées avec paiement à la livraison; les prix et les frais sont recalculés côté serveur.

## Prérequis

- Node.js et npm
- Rust et Cargo

Pour le déploiement Docker : Docker Engine avec Docker Compose.

## Démarrage local

1. Copier `.env.example` vers `.env`, puis définir `JWT_SECRET` avec une chaîne secrète d'au moins 32 caractères, `ADMIN_EMAIL` et `ADMIN_PASSWORD` (au moins 10 caractères).
2. Démarrer l'API depuis la racine du projet :

   ```powershell
   cargo run --manifest-path backend/Cargo.toml
   ```

   L'API initialise `aura_skin.db`, importe le catalogue initial lors du premier démarrage et crée le compte admin configuré dans `.env`.
3. Dans un autre terminal, installer et démarrer le site :

   ```powershell
   npm install
   npm run dev
   ```

Le site tourne sur `http://localhost:3000` et Vite transmet `/api` à l'API Rust sur `http://127.0.0.1:8080`. La variable `DATABASE_PATH` permet de choisir le fichier SQLite.
Le tableau de bord administrateur est disponible sur `http://localhost:3000/ikrame`. Le premier accès utilise `ADMIN_EMAIL` et `ADMIN_PASSWORD` configurés dans `.env`; l'e-mail et le mot de passe peuvent ensuite être modifiés dans l'onglet « Accès admin ».

Le compte administrateur n'est créé qu'au premier démarrage de l'API. Si la base SQLite existe déjà, modifier `ADMIN_EMAIL` ou `ADMIN_PASSWORD` ne change pas le compte existant. Pour réinitialiser un accès admin perdu, définir temporairement `ADMIN_RESET_PASSWORD` (10 caractères minimum) puis redémarrer l'API : l'e-mail admin est aligné sur `ADMIN_EMAIL` et le mot de passe devient `ADMIN_RESET_PASSWORD`. Retirer ensuite cette variable. Cette procédure est aussi utilisable sur une plateforme comme Railway, à condition que le volume de la base soit conservé.
Les clients peuvent créer un compte sur `/signup` ou se connecter sur `/login`. Les pages légales publiques sont `/conditions-utilisation`, `/politique-confidentialite` et `/politique-expedition`.

## API

- `GET /api/health`, `GET /api/products`
- `GET /api/reviews`
- `POST /api/analytics/page-view` (visite anonyme, identifiant aléatoire du navigateur)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/orders` (commande invitée ou compte connecté, paiement à la livraison)
- `GET /api/orders/me` (JWT client)
- `POST /api/admin/products`, `PUT /api/admin/products/:id`, `DELETE /api/admin/products/:id` (JWT admin)
- `POST /api/admin/reviews`, `PUT /api/admin/reviews/:id`, `DELETE /api/admin/reviews/:id` (JWT admin)
- `PUT /api/admin/account` (JWT admin, vérification du mot de passe actuel)
- `GET /api/admin/analytics` (JWT admin; visiteurs estimés, pages vues et pages populaires)
- `GET /api/admin/orders` (JWT admin)

Les statistiques utilisent un identifiant aléatoire conservé dans le navigateur; aucun nom, e-mail ou adresse IP n'est enregistré. Les routes admin utilisent le compte initial configuré dans `.env`. Les mots de passe sont hachés avec Argon2; les jetons JWT expirent après 24 heures. Le paiement en ligne n'est pas activé.

## Déploiement Docker

1. Si `.env` n'existe pas, le créer depuis PowerShell :

   ```powershell
   Copy-Item .env.example .env
   ```

   Dans `.env`, remplacer `JWT_SECRET` par une valeur aléatoire secrète d'au moins 32 caractères et choisir un `ADMIN_EMAIL` et un `ADMIN_PASSWORD` uniques et solides. Ne jamais publier `.env`.
2. Construire et démarrer les deux conteneurs :

   ```powershell
   docker compose up --build -d
   ```

3. Ouvrir `http://localhost:8081` (ou le port défini par `WEB_PORT`).

Nginx sert le frontend et transmet les requêtes `/api` au backend Axum. La base SQLite est conservée dans le volume Docker `aura_skin_data` lors des redémarrages et reconstructions normales. `docker compose down` conserve ce volume; ne pas utiliser `docker compose down -v` si les données doivent être gardées. Pour un hébergement public, utiliser HTTPS via le proxy ou la plateforme d'hébergement et configurer des secrets de production.

Cette configuration requiert un hébergement qui accepte Docker Compose (deux services : site et API). Docker doit être installé localement ou sur le serveur; pour une plateforme qui n'accepte qu'une seule image, la configuration devra être adaptée à cette plateforme.
