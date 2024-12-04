import React, { FC, ReactNode } from 'react';

interface AppProps { 
   children: ReactNode;
}

const App: FC<AppProps> = ({ children }) => {
   return (
      <>
         <main>{children}</main>
      </>
   );
};
export default App;