declare module '*.jsx' {
  const component: import('react').ComponentType<any>;
  export default component;
}
