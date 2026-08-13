/**
 * ratingCalculator.js
 *
 * Recalculates and persists aggregate rating data on the Cafe document
 * after any review is created, updated, or deleted.
 *
 * Called by reviewController after every review mutation.
 */

const Review = require("../models/Review");
const Cafe   = require("../models/Cafe");

/**
 * Recalculates all average ratings for a given cafe and saves them.
 * @param {string|ObjectId} cafeId - The _id of the cafe to update.
 */
const recalculateCafeRatings = async (cafeId) => {
  // Use MongoDB aggregation for a single round-trip
  const result = await Review.aggregate([
    { $match: { cafe: cafeId } },
    {
      $group: {
        _id: "$cafe",
        avgOverall:    { $avg: "$overallRating" },
        avgCoffee:     { $avg: "$coffeeRating" },
        avgFood:       { $avg: "$foodRating" },
        avgAmbience:   { $avg: "$ambienceRating" },
        avgWifi:       { $avg: "$wifiRating" },
        avgQuietness:  { $avg: "$quietnessRating" },
        avgValue:      { $avg: "$valueRating" },
        count:         { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    // No reviews left — reset cafe stats to defaults
    await Cafe.findByIdAndUpdate(cafeId, {
      averageRating: 0,
      reviewCount:   0,
      ratings: {
        coffee:    0,
        food:      0,
        ambience:  0,
        wifi:      0,
        quietness: 0,
        value:     0,
      },
    });
    return;
  }

  const data = result[0];

  const round1 = (n) => Math.round((n ?? 0) * 10) / 10;

  await Cafe.findByIdAndUpdate(cafeId, {
    averageRating: round1(data.avgOverall),
    reviewCount:   data.count,
    ratings: {
      coffee:    round1(data.avgCoffee),
      food:      round1(data.avgFood),
      ambience:  round1(data.avgAmbience),
      wifi:      round1(data.avgWifi),
      quietness: round1(data.avgQuietness),
      value:     round1(data.avgValue),
    },
  });
};

module.exports = { recalculateCafeRatings };
