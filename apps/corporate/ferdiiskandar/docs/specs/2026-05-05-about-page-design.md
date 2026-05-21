# About Page Design

- Date: 2026-05-05
- Project: `ferdiiskandar`
- Scope: First release of the `/about` page
- Status: Proposed for review

## 1. Context

The site now has a stabilized founder-profile landing page and a clean baseline commit. The next expansion should begin the actual multi-page architecture without breaking the editorial identity that was just stabilized.

The user selected `/about` as the first feature phase. This page should not be a biography-heavy page or a generic corporate profile. It should function as a high-trust editorial page that strengthens professional positioning and expresses the founder’s worldview.

The intended direction is:

- professional positioning
- manifesto and worldview
- editorial-intellectual tone
- balanced outcome: understand the founder, trust the builder, and feel ready to open a conversation

## 2. Product Goal

The first `/about` release should establish a real route that deepens the site’s identity beyond the landing page. It should make the visitor feel that dr. Ferdi Iskandar is not only a founder with vision, but also a disciplined systems thinker with a coherent view of healthcare, intelligence, responsibility, and institution-scale execution.

This page should make the site architecture feel more mature by becoming the first true expansion route in the multi-page direction.

## 3. Chosen Page Strategy

Chosen page strategy: `Layered authority page`

This means the reading experience should move in a deliberate sequence:

1. clarify who the founder is now
2. explain how he thinks
3. show why that thinking is credible
4. open the door to further conversation

This structure avoids the two main failure modes:

- a long biography that dilutes authority
- a manifesto page that sounds intellectual but feels detached from real work

## 4. Audience Outcome

The page should produce a balanced outcome:

- the visitor understands the founder
- the visitor trusts the builder
- the visitor feels comfortable opening a conversation

The primary audience is likely to evaluate the founder first and the systems second, so the page should be led by positioning and worldview rather than technical inventory.

## 5. Architecture and Reading Flow

The page should be built as a dedicated route at `/about` and should read like a composed editorial page with clear internal rhythm.

Reading flow:

1. `Opening frame`
   Immediate professional framing, no chronology.
2. `Positioning statement`
   Clear expression of current professional identity and domain.
3. `Worldview / manifesto`
   The core philosophy about care, intelligence, systems, and human judgment.
4. `Operating principles`
   A concrete translation of worldview into working principles.
5. `Authority signals`
   Curated proof that the worldview stands on real leadership and real system-building direction.
6. `Closing invitation`
   A calm invitation into further reading or direct conversation.

This should feel like a deeper room within the same house, not a disconnected microsite.

## 6. Content Model and Section Breakdown

### 6.1 Identity Thesis

The top of the page should state who Ferdi Iskandar is in present-tense professional language. It should not begin with life history.

This section should include:

- a strong headline
- a concise positioning thesis
- a short domain context line

### 6.2 Professional Positioning Block

This block should define the professional stack clearly and calmly.

It should frame the founder as a combination of:

- physician
- founder
- systems architect
- clinical intelligence builder
- strategic transformation thinker

This is not a resume list. It is an identity structure.

### 6.3 Manifesto Block

This is the intellectual center of the page.

It should explain:

- how technology should behave in healthcare
- why intelligence should support judgment instead of replacing it
- why accountability matters as much as capability
- why real systems must respect institutional constraints rather than idealized product thinking

The format should favor 2-4 manifesto paragraphs with strong cadence rather than one long wall of text.

### 6.4 Operating Principles Block

This block should convert worldview into working logic.

Principles should feel concrete, such as:

- intelligence should clarify, not distract
- systems must preserve human judgment
- healthcare technology must remain accountable
- architecture must fit real operational conditions

This section should feel more structured than the manifesto block.

### 6.5 Authority Signals Block

This section should provide curated proof without turning into a long biodata page.

It may include:

- leadership framing
- institutional direction
- system-building seriousness
- domain commitment

This block must reinforce trust without becoming promotional noise.

### 6.6 Systems Bridge

The page should include a short bridge that connects who the founder is with what the founder builds.

Its job is to naturally point toward `/systems` later, without turning `/about` into a second systems page.

### 6.7 Closing Invitation

The ending should not feel like a sales CTA. It should feel like a calm but intentional invitation.

The message should imply:

- if this way of thinking is relevant to your institution or collaboration goal
- then the next step is a conversation

## 7. Visual Direction

The `/about` page should remain inside the same editorial family as the homepage, but with more reading focus and less spectacle.

Visual principles:

- preserve the serif/sans editorial contrast
- preserve the premium monograph atmosphere
- reduce layout noise compared with the landing page
- create more breathing room and stronger vertical rhythm
- emphasize readability over display

This page should feel:

- authoritative
- composed
- intellectual
- human
- quietly persuasive

It should not feel:

- flashy
- generic startup-landing-page
- plain biography template
- cold corporate profile

## 8. Interaction Behavior

This page should be light on interaction and strong on reading flow.

Interaction principles:

- minimal motion only
- no gimmick interactions
- clean route navigation
- strong mobile readability
- subtle emphasis through spacing, framing, and typographic control

The most important “interaction” here is how the content unfolds visually and cognitively.

## 9. Implementation Scope

Included in first-release scope:

- create the `/about` route
- update shared navigation so `/about` becomes part of the real architecture
- implement the approved section structure
- add an about-specific styling layer
- add route-specific metadata
- add route-level tests
- verify build and navigation integrity

Explicitly out of scope:

- portrait photography systems
- detailed chronology or timeline modules
- CMS-backed authoring
- downloadable press-kit/CV
- multilingual support
- advanced motion systems
- deep systems integration beyond a small bridge section

## 10. Definition of Success

The first `/about` release succeeds if:

- `/about` exists as a real route
- it feels like a natural extension of the homepage
- the founder’s professional positioning is clear
- the manifesto and worldview are distinct and credible
- the page increases trust in the founder as a builder
- the page gently prepares the reader for either `/systems` or direct conversation
- the multi-page architecture feels genuinely started

## 11. Executive Profile Grounding

The executive-profile notebook supplied by the user adds a stronger editorial center for this page. The `/about` route should absorb the parts that strengthen public positioning while avoiding language that sounds too internal, too absolute, or too dependent on unverified claims.

The strongest themes to carry into the page are:

- a physician-executive working from real clinical and institutional conditions
- a founder who treats accountability as system architecture rather than policy decoration
- a builder who frames AI as augmentation under human judgment, not autonomous authority
- an operator shaped by healthcare transformation, governance pressure, and implementation reality
- a worldview that values quiet execution over promotional spectacle

The authority layer should be grounded by careful public-safe signals such as:

- sustained healthcare executive leadership
- civil-law and medical-malpractice literacy informing governance design
- active research engagement in responsible healthcare AI
- institutional transformation and crisis-navigation experience
- explicit safety and accountability architecture in system design

The page should avoid or soften claims that are too absolute, too internal, or likely to trigger verification questions in a public founder profile. Examples include:

- patent-protection statements unless registration details are publication-ready
- extreme research-intensity claims phrased in a hyperbolic way
- exact public performance metrics that are not yet intended for marketing use
- confidential roadmap or validation language copied too literally from internal profile material

## 12. Risks and Constraints

- the page can drift too far into biography unless the positioning-first rule is maintained
- the page can drift too far into abstract writing unless authority signals remain grounded
- the existing visual system is strong, so the new route should extend it rather than reset it
- route expansion should not trigger a broad site-wide redesign during this phase

## 13. Post-Spec Next Step

After approval of this spec, the next step is to write an implementation plan for the first `/about` release and then execute it against the current baseline branch.
