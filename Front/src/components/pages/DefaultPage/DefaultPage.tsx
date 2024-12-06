import React, { FC } from 'react';
import {
   PageWrapper,
   PageContainer
} from '../Page.styled.ts';

interface DefaultPageProps { }

const DefaultPage: FC<DefaultPageProps> = () => {
   return (
      <PageWrapper>
         <PageContainer>
            <h4 style={{color: "white", marginTop: "64px", textAlign: "center"}}>You have to be loggen in</h4>
         </PageContainer>
      </PageWrapper >
   );
};

export default DefaultPage;