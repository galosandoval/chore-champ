<svelte:head>
	<title>How to play Sverdle</title>
	<meta name="description" content="How to play Sverdle" />
</svelte:head>

<div class="text-column">
	<h1>How to play Sverdle</h1>

	<p>
		Sverdle is a clone of <a href="https://www.nytimes.com/games/wordle/index.html">Wordle</a>, the
		word guessing game. To play, enter a five-letter English word. For example:
	</p>

	<div class="example">
		<span class="close">r</span>
		<span class="missing">i</span>
		<span class="close">t</span>
		<span class="missing">z</span>
		<span class="exact">y</span>
	</div>

	<p>
		The <span class="exact">y</span> is in the right place. <span class="close">r</span> and
		<span class="close">t</span>
		are the right letters, but in the wrong place. The other letters are wrong, and can be discarded.
		Let's make another guess:
	</p>

	<div class="example">
		<span class="exact">p</span>
		<span class="exact">a</span>
		<span class="exact">r</span>
		<span class="exact">t</span>
		<span class="exact">y</span>
	</div>

	<p>This time we guessed right! You have <strong>six</strong> guesses to get the word.</p>

	<p>
		Unlike the original Wordle, Sverdle runs on the server instead of in the browser, making it
		impossible to cheat. It uses <code>&lt;form&gt;</code> and cookies to submit data, meaning you can
		even play with JavaScript disabled!
	</p>
</div>
