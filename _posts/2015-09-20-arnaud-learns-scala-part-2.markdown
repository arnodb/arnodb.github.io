---
layout: post
title: Arnaud learns Scala - part 2
published: false
---

One of the basics of functional programming: tail recursion – or how to write an iterative code that
looks recursive.

Tail-recursive factorial
------------------------

[Scala By Example](http://www.scala-lang.org/docu/files/ScalaByExample.pdf) describes tail recursion
and asks the reader to design a tail-recursive version of the factorial function.

That is easy with the help of a nested function which acts as an accumulator:

{% highlight scala %}
import scala.annotation.tailrec

def factorial(n: Int): Int = {
    @tailrec def fact(f: Int, m: Int): Int = if (m <= 1) f else fact(m * f, m - 1)
    fact(n, n - 1)
}

println(factorial(5));

{% endhighlight %}

Note: ``@tailrec`` only ensures the nested function is recognized as a tail-recursive function but
it isn't required.

Performance figures
-------------------

In order to show the runtime difference let me compare the performance between the simply-recursive
version and the tail-recursive version, the code is:

{% highlight scala %}
import scala.annotation.tailrec

def factorial1(n: Int): Int = if (n == 0) 1 else n * factorial1(n - 1)

def factorial2(n: Int): Int = {
    @tailrec def fact(f: Int, m: Int): Int = if (m <= 1) f else fact(m * f, m - 1)
    fact(n, n - 1)
}

def test(fact: (Int) => Int) = {
    val t1 = System.currentTimeMillis()
    for (x <- 1 to 1000 * 1000 * 1000) {
        val b = fact(16)
    }
    val t2 = System.currentTimeMillis()
    println(t2 - t1)
}

if (args.length > 0 && args(0) == "tailrec") {
    for (x <- 1 to 10) test(factorial2)
} else {
    for (x <- 1 to 10) test(factorial1)
}
{% endhighlight %}

The output for *factorial1* is:

{% highlight text %}
143978
146334
146322
146454
146180
146301
146540
146427
146097
146343
{% endhighlight %}

The output for *factorial2* is:

{% highlight text %}
3688
2445
1814
1821
1818
1815
1818
1815
1815
1816
{% endhighlight %}

Convinced or need to see the bytecode?

Bytecode of the tail-recursive version
--------------------------------------

The decompiled java code of the tail-recursive version looks like this:

{% highlight java %}

    public int factorial(int n) {
        return this.fact$1(n, n - 1);
    }

    private final int fact$1(int f, int m) {
        while (m > 1) {
            int n = m * f;
            --m;
            f = n;
        }
        return f;
    }

{% endhighlight %}

That shows the actual effect of the tail-recursive design.

