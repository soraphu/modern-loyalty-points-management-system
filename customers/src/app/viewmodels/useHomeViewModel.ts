import { useState } from 'react';

export function useHomeViewModel() {
    const [appearConfirmLogout, setAppearConfirmLogout] = useState<boolean>(false);

    return {
        appearConfirmLogout,
        setAppearConfirmLogout
    };
}