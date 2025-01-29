import { createContext, useEffect, useState, useContext } from "react";
import { fakeFetchCrypto, fetchAssets } from "../api.js";
import { percentDifference } from "../utils.js";

export const CryptoContext = createContext({
  assets: [],
  crypto: [],
  loading: false,
});

export default function CryptoContextProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [crypto, setCrypto] = useState([]);
  const [assets, setAssets] = useState([]);

	function mapAssets(assets, result) {
    return assets.map((asset) => {
      const coin = result.find((c) => c.id === asset.id);
      const assetPrice = parseFloat(asset.price) || 0;
      const coinPrice = parseFloat(coin.price) || 0;
      const assetAmount = parseFloat(asset.amount) || 0;

      return {
        grow: assetPrice < coinPrice,
        growPercent: percentDifference(assetPrice, coinPrice),
        totalAmount: assetAmount * coinPrice,
        totalProfit: assetAmount * coinPrice - assetAmount * assetPrice,
        name: coin.name,
        ...asset,
      };
    });
  }


  useEffect(() => {
    async function preload() {
      setLoading(true);
      const { result } = await fakeFetchCrypto();
      const assets = await fetchAssets();
      
			setAssets(mapAssets(assets, result));
      setCrypto(result);
      setLoading(false);
    }
    preload();
  }, []);

  function addAsset(newAsset) {
    setAssets((prev) => mapAssets([...prev, newAsset], crypto))
  }

  return (
    <CryptoContext.Provider value={{ loading, crypto, assets, addAsset }}>
      {children}
    </CryptoContext.Provider>
  );
}

export function useCrypto() {
  return useContext(CryptoContext);
}
