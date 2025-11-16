# EventFinder9

EventFinder9 është një aplikacion mobil i zhvilluar me React Native (Expo) që u mundëson përdoruesve të zbulojnë, ruajnë, organizojnë dhe vlerësojnë evente. Aplikacioni përdor Firebase si backend për autentifikim dhe ruajtjen e të dhënave dhe ofron një eksperiencë të shpejtë dhe moderne.

## 1. Lidhja me Firebase

Aplikacioni është i lidhur plotësisht me Firebase:

- Firebase Authentication për login/register
- Firebase Firestore për ruajtjen e eventeve, përdoruesve, porosive të biletave dhe komenteve
- Firebase Storage për ruajtjen e imazheve të eventeve

Të gjitha të dhënat merren dhe menaxhohen në kohë reale nga Firebase.

## 2. Autentifikimi (Firebase Authentication)

Të implementuara:

- Login me Email dhe Password
- Login me GitHub
- Validim i inputeve
- Redirect automatik në Home pas login
- Logout i implementuar

Rregulla:

- Vetëm përdoruesit e loguar mund të krijojnë evente
- Vetëm përdoruesi mund t’i shohë të dhënat e veta (My Tickets, Saved Events, profili personal)

## 3. CRUD me Firebase Firestore

Funksionalitetet e implementuara:

- Krijimi i eventeve të reja (vetëm nga përdoruesi i loguar)
- Leximi i eventeve në Discover, Past Events dhe Saved Events
- Përditësimi i të dhënave të profilit dhe eventeve
- Fshirja e eventeve ose të dhënave personale
- Përdorimi i `useEffect` dhe `useState` për menaxhim state

Gjendjet e trajtuara: Loading, Error, Success

## 4. Past Events + Event Rating & Reviews

- Eventet që kanë përfunduar kategorizohen automatikisht te **Past Events**
- Pas përfundimit të eventit, përdoruesi mund të lërë:
  - Vlerësim me yje
  - Koment/review
- Të gjitha vlerësimet ruhen në Firebase Firestore

## 5. Tickets & Billing (My Tickets)

- Përdoruesi mund të blejë bileta (General / VIP)
- Zgjedhja e sasisë dhe llogaritja automatike e totalit
- Porositë ruhen në Firestore
- Seksioni **My Tickets** shfaq vetëm biletat e përdoruesit aktual
- Asnjë përdorues nuk mund të shohë biletat e tjetrit

## 6. Weather Feature

- Për çdo event shfaqet moti aktual në lokacionin e tij
- Është përdorur një API publike (OpenWeatherMap)
- Lokacioni i eventit përdoret dinamikisht për marrjen e të dhënave të motit

## 7. Navigimi dhe UI

- Navigim i plotë i implementuar me Expo Router
- Dizajn modern dhe i organizuar
- Strukturë e pastër e projektit

Antarët e grupit : Albena Mehmeti , Arbias Bala , Arisa Dragusha , Kaltrinë Heta , Uran Gegaj , Yll Cervadiku .