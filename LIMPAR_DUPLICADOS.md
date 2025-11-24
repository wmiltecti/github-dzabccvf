# Como Limpar Duplicados do LocalStorage

Abra o Console do navegador (F12) e execute:

```javascript
// 1. Carrega a lista atual
const stored = localStorage.getItem('mockup_enterprises');
const list = stored ? JSON.parse(stored) : [];

console.log('📊 Total de registros ANTES:', list.length);
console.log('📋 IDs atuais:', list.map(e => e.id));

// 2. Remove duplicados mantendo apenas o último de cada ID
const uniqueMap = new Map();
list.forEach(emp => {
  uniqueMap.set(emp.id, emp); // Sobrescreve se já existe
});

const uniqueList = Array.from(uniqueMap.values());

console.log('📊 Total de registros DEPOIS:', uniqueList.length);
console.log('📋 IDs únicos:', uniqueList.map(e => e.id));
console.log('🗑️ Removidos:', list.length - uniqueList.length, 'duplicados');

// 3. Salva de volta
localStorage.setItem('mockup_enterprises', JSON.stringify(uniqueList));

console.log('✅ LocalStorage limpo com sucesso!');
```

## Ou limpar TUDO e começar do zero:

```javascript
localStorage.removeItem('mockup_enterprises');
console.log('✅ Todos os empreendimentos salvos foram removidos!');
// Recarregue a página para ver apenas os 6 empreendimentos base
```
