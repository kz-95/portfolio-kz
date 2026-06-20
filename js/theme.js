/* theme.js - dark/light mode toggle */
(function(){
  const toggle = document.querySelector('.theme-switch__checkbox');
  if(!toggle)return;
  const emit = (dark)=>window.dispatchEvent(new CustomEvent('themechange',{detail:{dark}}));
  const saved = localStorage.getItem('theme');
  if(saved==='dark'){document.body.classList.add('dark');toggle.checked=true;}
  emit(document.body.classList.contains('dark'));
  toggle.addEventListener('change',()=>{
    document.body.classList.toggle('dark',toggle.checked);
    localStorage.setItem('theme',toggle.checked?'dark':'light');
    emit(toggle.checked);
  });
})();
