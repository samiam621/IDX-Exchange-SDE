import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOpenHouses, fetchPropertyDetail } from '../api/client';
import { formatPrice } from '../utils';
import PropertyImageGallery from '../components/PropertyImageGallery';
import PropertyMap from '../components/PropertyMap';
import OpenHouses from '../components/OpenHouses';

// "CentralAir,RangeHood" -> "Central Air, Range Hood" (the DB squishes list values together)
function prettyList(value) {
  return String(value).split(',').map((s) => s.replace(/([a-z])([A-Z])/g, '$1 $2')).join(', ');
}

// Rows for the "Property Details" table: [label, value]. Empty ones get filtered out.
function getDetails(p) {
  return [
    ['Property type', p.L_Type_ && prettyList(p.L_Type_)],
    ['Status', p.L_Status],
    ['MLS #', p.L_DisplayId],
    ['Days on market', p.DaysOnMarket],
    ['Lot size', p.LotSizeSquareFeet && `${Number(p.LotSizeSquareFeet).toLocaleString()} sqft`],
    ['Stories', p.StoriesTotal],
    ['Subdivision', p.SubdivisionName],
    ['HOA fee', p.AssociationFee && `${formatPrice(p.AssociationFee)} ${p.AssociationFeeFrequency || ''}`],
    ['Cooling', p.Cooling && prettyList(p.Cooling)],
    ['Heating', p.Heating && prettyList(p.Heating)],
    ['View', p.View && prettyList(p.View)],
    ['School district', p.HighSchoolDistrict],
    ['Listing agent', p.ListAgentFullName],
    ['Office', p.LO1_OrganizationName],
  ].filter(([, value]) => value);
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  // result of the last finished request, tagged with the id it was for (same idea as ListingsPage)
  const [result, setResult] = useState({ id: null });
  const loading = result.id !== id;

  useEffect(() => {
    let stale = false;
    Promise.all([fetchPropertyDetail(id), fetchOpenHouses(id)])
      .then(([property, openHouses]) => !stale && setResult({ id, property, openHouses }))
      .catch((err) => !stale && setResult({ id, error: err.message }));
    return () => { stale = true; };
  }, [id]);

  let content;
  if (loading) content = <p className="status">Loading property...</p>;
  else if (result.error) content = <p className="status error">Error: {result.error}</p>;
  else {
    const p = result.property;
    content = (
      <>
        <PropertyImageGallery photos={p.L_Photos} alt={p.L_Address} />

        <h1>{formatPrice(p.L_SystemPrice)}</h1>
        <p className="address">{p.L_Address}, {p.L_City}, {p.L_State} {p.L_Zip}</p>

        <div className="stats">
          <div><strong>{p.L_Keyword2 ?? '-'}</strong> beds</div>
          <div><strong>{p.LM_Dec_3 ? Number(p.LM_Dec_3) : '-'}</strong> baths</div>
          <div><strong>{p.LM_Int2_3?.toLocaleString() ?? '-'}</strong> sqft</div>
          <div><strong>{p.YearBuilt || '-'}</strong> year built</div>
        </div>

        <section>
          <h2>Description</h2>
          <p>{p.L_Remarks || 'No description available.'}</p>
        </section>

        <section>
          <h2>Property Details</h2>
          <dl className="details">
            {getDetails(p).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2>Open Houses</h2>
          <OpenHouses openHouses={result.openHouses} />
        </section>

        {p.LMD_MP_Latitude && p.LMD_MP_Longitude && (
          <section>
            <h2>Location</h2>
            <PropertyMap lat={p.LMD_MP_Latitude} lng={p.LMD_MP_Longitude} />
          </section>
        )}
      </>
    );
  }

  return (
    <div className="page detail">
      <Link to="/" className="back">← Back to listings</Link>
      {content}
    </div>
  );
}
